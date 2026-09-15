import { ScheduledGame } from "../../../domain/scheduledGame/entities/ScheduledGame";
import { CancellationModelRepository } from "../../../domain/model/repositoryInterface/CancellationModelRepository";
import { PredictionWeatherFeatureAggregator } from "../../../domain/prediction/services/PredictionWeatherFeatureAggregator";
import { CancellationProbability } from "../../../domain/prediction/valueObjects/CancellationProbability";
import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { TimeWindowSpec } from "../../../domain/training/valueObjects/TimeWindowSpec";
import { DomainError } from "../../../shared/errors/DomainError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { PredictCancellationRequest } from "../dtos/PredictCancellationRequest";
import { PredictCancellationResponse } from "../dtos/PredictCancellationResponse";
import { CancellationPredictor } from "../interfaces/CancellationPredictor";
import { mapAggregatedPredictionWeatherFeaturesToRow } from "../mapper/mapAggregatedPredictionWeatherFeaturesToRow";
import { mapCancellationModelToDto } from "../mapper/mapCancellationModelToDto";
import { BallParkCatalog } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { HourlyWeatherForecastProvider } from "../interfaces/HourlyWeatherForecastProvider";
import { BallParkHourlyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { mapHourlyWeatherForecastDtoToProps } from "../mapper/mapHourlyWeatherForecastDtoToProps";
import { BallParkHourlyWeatherForecast } from "../../../domain/weatherForecast/valueObjects/BallParkHourlyWeatherForecast";
import { CancellationPredictionRepository } from "../interfaces/CancellationPredictionRepository";
import { ShadowSourceBreakdownDto } from "../dtos/CancellationPredictionDto";
import { AggregatedPredictionWeatherFeatures } from "../../../domain/prediction/valueObjects/AggregatedPredictionWeatherFeatures";
import { PrecipitationSeriesResolver } from "../services/PrecipitationSeriesResolver";
import { PrecipitationResolutionRepository } from "../interfaces/PrecipitationResolutionRepository";
import { PrecipitationSource } from "../interfaces/PrecipitationSampleProvider";
import { mapResolvedSeriesToResolutionDto } from "../mapper/mapResolvedSeriesToResolutionDto";
import { AppError } from "../../../shared/errors/AppError";
import { BatchStatusWriter } from "../../shared/interfaces/BatchStatusWriter";
import { recordBatchSuccess } from "../../shared/utils/recordBatchSuccess";

type PredictResult =
  | {
      success: true;
      gameId: string;
      probability: number;
      modelVersion: string;
    }
  | {
      success: false;
      gameId: string;
      modelVersion: string | null;
      error: string;
    };

export class PredictCancellationUseCase {
  constructor(
    private readonly gameRepository: ScheduledGameRepository,
    private readonly modelRepository: CancellationModelRepository,
    private readonly predictor: CancellationPredictor,
    private readonly weatherForecastProvider: HourlyWeatherForecastProvider,
    private readonly ballParkHourlyWeatherForecastRepository: BallParkHourlyWeatherForecastRepository,
    private readonly predictionRepository: CancellationPredictionRepository,
    private readonly batchStatusWriter: BatchStatusWriter,
    // シャドー運用のための並走。未注入なら従来どおりの動作になる。
    // 表示に使う確率には影響しないため、任意依存にしてある。
    private readonly precipitationSeriesResolver?: PrecipitationSeriesResolver,
    private readonly precipitationResolutionRepository?: PrecipitationResolutionRepository,
  ) {}

  async execute(
    req: PredictCancellationRequest,
  ): Promise<PredictCancellationResponse> {
    try {
      const from = req.todayDate;
      const to = new Date(req.todayDate);
      to.setDate(to.getDate() + req.forecastDays - 1); // 例: forecastDays=7 なら今日+6日まで
      const games = await this.gameRepository.findByDate(from, to);

      // [TODO] 消す
      if (games.length === 0 && process.env.USE_TEST_GAME === "1") {
        const date = new Date(req.todayDate);
        date.setHours(14, 0, 0, 0);
        const testGame = ScheduledGame.create({
          date, // その日の任意時刻でもOK
          category: "オープン戦", // 既知カテゴリを使う
          homeTeam: "HT", // BaseballTeamTypeにある名前
          awayTeam: "YG",
          ballPark: BallParkCatalog.HANSHIN_KOSHIEN_STADIUM.labelJa,
        });
        games.push(testGame);
      }
      if (games.length === 0) {
        // 対象試合が0件でもバッチとしては正常完了なので完了時刻を記録する
        await recordBatchSuccess(this.batchStatusWriter, "prediction");
        return {
          message: "本日の対象試合はありませんでした",
          results: [],
        };
      }

      const results: PredictResult[] = [];

      for (const game of games) {
        try {
          if (!game.ballPark.isOpenAir()) {
            results.push({
              success: false,
              gameId: game.id.toString(),
              modelVersion: null,
              error: "屋内球場は中止予測の対象外",
            });
            continue;
          }
          const model = await this.modelRepository.findLatest(
            game.ballPark.id(),
          );
          if (!model) throw new NotFoundError("モデルが見つかりません", {});

          const daysAhead = Math.floor(
            (game.date.getTime() - req.todayDate.getTime()) /
              (24 * 60 * 60 * 1000),
          );
          const requiredDays =
            daysAhead + Math.ceil(req.timeWindowAfterHours / 24);
          if (req.forecastDays < requiredDays) {
            throw new ValidationError("予測に必要な予報日数が足りません", {
              requiredDays,
              forecastDays: req.forecastDays,
              daysAhead,
            });
          }

          const window = TimeWindowSpec.create({
            beforeHours: req.timeWindowBeforeHours,
            afterHours: req.timeWindowAfterHours,
          });
          const { from, to } = window.toRange(game.date);

          // 気象データを取得
          const hourlyWeatherForecasts = (
            await this.weatherForecastProvider.fetchHourlyForecasts(
              BallParkWeatherPoint.create(game.ballPark.id()).latitude(),
              BallParkWeatherPoint.create(game.ballPark.id()).longitude(),
              req.forecastDays,
            )
          )
            .map((hourlyWeatherForecastDto) =>
              mapHourlyWeatherForecastDtoToProps(
                hourlyWeatherForecastDto,
                game.ballPark.id(),
              ),
            )
            .map(BallParkHourlyWeatherForecast.create);

          // 気象データを永続化（TX1）
          await this.ballParkHourlyWeatherForecastRepository.updateMany(
            hourlyWeatherForecasts,
          );

          if (hourlyWeatherForecasts.length === 0)
            throw new ValidationError("予測に使える気象データがありません", {
              from,
              to,
            });

          const filteredHourlyWeatherForecasts = hourlyWeatherForecasts.filter(
            (f) => from <= f.date && f.date <= to,
          );

          if (filteredHourlyWeatherForecasts.length === 0)
            throw new ValidationError("予測に使える気象データがありません", {
              from,
              to,
            });

          const modelDto = mapCancellationModelToDto(model);
          const predict = (
            forecasts: readonly BallParkHourlyWeatherForecast[],
          ) => {
            const features = PredictionWeatherFeatureAggregator.aggregate([
              ...forecasts,
            ]);
            return {
              features,
              probability: CancellationProbability.from(
                this.predictor.predict({
                  model: modelDto,
                  features: mapAggregatedPredictionWeatherFeaturesToRow(features),
                }),
              ).toNumber(),
            };
          };

          const baseline = predict(filteredHourlyWeatherForecasts);

          // 降水量を実況・短時間予報へ差し替えた系列でも計算する（シャドー運用）。
          // 表示は従来どおり baseline のままで、切り替えはフェーズ5で判断する。
          const shadow = await this.resolveShadow(
            game,
            filteredHourlyWeatherForecasts,
            predict,
          );

          // 予測結果を永続化（TX2）
          await this.predictionRepository.upsert({
            gameId: game.id.toString(),
            probability: baseline.probability,
            modelVersion: model.version.toString(),
            predictedAtUtc: new Date().toISOString(),
            ...(shadow
              ? {
                  shadowProbability: shadow.probability,
                  shadowSources: shadow.sources,
                  shadowFeatures: {
                    avgRainFall: shadow.features.avgRainFall.toNumber(),
                    rainOccurRate: shadow.features.rainOccurRate,
                    baselineAvgRainFall:
                      baseline.features.avgRainFall.toNumber(),
                    baselineRainOccurRate: baseline.features.rainOccurRate,
                  },
                  ...(shadow.oldestSourceTimeUtc
                    ? { oldestSourceTimeUtc: shadow.oldestSourceTimeUtc }
                    : {}),
                }
              : {}),
          });

          const normalized = baseline.probability;

          results.push({
            success: true,
            gameId: game.id.toString(),
            probability: normalized,
            modelVersion: model.version.toString(),
          });
        } catch (err) {
          if (err instanceof AppError) {
            console.error("予測が失敗しました。", {
              gameId: game.id.toString(),
              ballParkId: game.ballPark.id(),
              code: err.code,
              message: err.message,
              details: err.details,
              cause: (err as any).cause,
            });
          } else {
            console.error("予測が失敗しました。(不明なエラー)", {
              gameId: game.id.toString(),
              ballParkId: game.ballPark.id(),
              err,
            });
          }
          if (
            err instanceof DomainError ||
            err instanceof ValidationError ||
            err instanceof NotFoundError
          ) {
            results.push({
              success: false,
              gameId: game.id.toString(),
              modelVersion: null,
              error: err.message,
            });
            continue;
          }
          results.push({
            success: false,
            gameId: game.id.toString(),
            modelVersion: null,
            error: "予測処理に失敗しました",
          });
        }
      }
      // 1件も予測できていない場合は予測値が更新されていないので完了時刻を進めない。
      // （個別試合の失敗は results に残るため、一部成功なら更新扱いにする）
      if (results.some((result) => result.success)) {
        await recordBatchSuccess(this.batchStatusWriter, "prediction");
      }
      return {
        message: "予測処理を完了しました",
        results,
      };
    } catch (err) {
      if (
        err instanceof DomainError ||
        err instanceof ValidationError ||
        err instanceof NotFoundError
      ) {
        throw err;
      }
      throw new DomainError("試合中止確率の予測に失敗しました", {
        cause: err,
      });
    }
  }

  /**
   * 降水量を実況・短時間予報へ差し替えた系列で、もう一度確率を計算する。
   *
   * 表示には使わない。切り替え(フェーズ5)の判断材料を貯めるための並走で、
   * 失敗しても本来の予測を巻き添えにしないよう、ここで握りつぶして null を返す。
   *
   * Resolver 自体もスロット単位で Open-Meteo に退避する作りなので、
   * 差し替えが1件も起きなければ baseline と同じ値になる。
   * その場合も記録する。「一致していた」こと自体が切り分けに使えるため。
   */
  private async resolveShadow(
    game: ScheduledGame,
    baseSeries: readonly BallParkHourlyWeatherForecast[],
    predict: (forecasts: readonly BallParkHourlyWeatherForecast[]) => {
      features: AggregatedPredictionWeatherFeatures;
      probability: number;
    },
  ): Promise<{
    probability: number;
    features: AggregatedPredictionWeatherFeatures;
    sources: ShadowSourceBreakdownDto;
    oldestSourceTimeUtc?: string;
  } | null> {
    if (!this.precipitationSeriesResolver) return null;

    try {
      const resolvedAt = new Date();
      const resolved = await this.precipitationSeriesResolver.resolve({
        baseSeries,
        now: resolvedAt,
      });

      const sources: ShadowSourceBreakdownDto = {
        observation: 0,
        shortRangeForecast: 0,
        baseline: 0,
      };
      let oldestSourceTime: Date | null = null;
      for (const slot of resolved.slots) {
        if (slot.source === PrecipitationSource.AMEDAS_OBSERVATION) {
          sources.observation += 1;
        } else if (
          slot.source === PrecipitationSource.JMA_SHORT_RANGE_FORECAST
        ) {
          sources.shortRangeForecast += 1;
          if (
            slot.sourceTime &&
            (!oldestSourceTime || slot.sourceTime < oldestSourceTime)
          ) {
            oldestSourceTime = slot.sourceTime;
          }
        } else {
          sources.baseline += 1;
        }
      }

      // 差し替えの内訳はスロット単位でも残す。降水短時間予報にはアーカイブが無く、
      // ここで残さないと較正(フェーズ4)で後から復元できないため。
      if (this.precipitationResolutionRepository) {
        try {
          await this.precipitationResolutionRepository.append(
            mapResolvedSeriesToResolutionDto(resolved, resolvedAt),
          );
        } catch (err) {
          console.error("差し替え記録の保存に失敗しました", {
            gameId: game.id.toString(),
            err,
          });
        }
      }

      const { probability, features } = predict(resolved.forecasts);
      return {
        probability,
        features,
        sources,
        ...(oldestSourceTime
          ? { oldestSourceTimeUtc: oldestSourceTime.toISOString() }
          : {}),
      };
    } catch (err) {
      console.error("シャドー計算に失敗しました", {
        gameId: game.id.toString(),
        ballParkId: game.ballPark.id(),
        err,
      });
      return null;
    }
  }
}
