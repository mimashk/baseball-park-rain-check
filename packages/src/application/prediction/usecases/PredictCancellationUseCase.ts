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
    private readonly predictionRepository: CancellationPredictionRepository
  ) {}

  async execute(
    req: PredictCancellationRequest
  ): Promise<PredictCancellationResponse> {
    try {
      const games = await this.gameRepository.findAtDate(req.todayDate);

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
            game.ballPark.id()
          );
          if (!model) throw new NotFoundError("モデルが見つかりません", {});

          const requiredDays = Math.ceil(req.timeWindowAfterHours / 24);
          if (req.forecastDays < requiredDays) {
            throw new ValidationError("予測に必要な予報日数が足りません", {
              requiredDays,
              forecastDays: req.forecastDays,
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
              req.forecastDays
            )
          )
            .map((hourlyWeatherForecastDto) =>
              mapHourlyWeatherForecastDtoToProps(
                hourlyWeatherForecastDto,
                game.ballPark.id()
              )
            )
            .map(BallParkHourlyWeatherForecast.create);

          // 気象データを永続化（TX1）
          await this.ballParkHourlyWeatherForecastRepository.updateMany(
            hourlyWeatherForecasts
          );

          if (hourlyWeatherForecasts.length === 0)
            throw new ValidationError("予測に使える気象データがありません", {
              from,
              to,
            });

          const filteredHourlyWeatherForecasts = hourlyWeatherForecasts.filter(
            (f) => from <= f.date && f.date <= to
          );

          if (filteredHourlyWeatherForecasts.length === 0)
            throw new ValidationError("予測に使える気象データがありません", {
              from,
              to,
            });

          const aggregatedFeatures =
            PredictionWeatherFeatureAggregator.aggregate(
              filteredHourlyWeatherForecasts
            );

          const probability = this.predictor.predict({
            model: mapCancellationModelToDto(model),
            features:
              mapAggregatedPredictionWeatherFeaturesToRow(aggregatedFeatures),
          });

          const normalized =
            CancellationProbability.from(probability).toNumber();

          // 予測結果を永続化（TX2）
          await this.predictionRepository.upsert({
            gameId: game.id.toString(),
            probability: normalized,
            modelVersion: model.version.toString(),
            predictedAtUtc: new Date().toISOString(),
          });

          results.push({
            success: true,
            gameId: game.id.toString(),
            probability: normalized,
            modelVersion: model.version.toString(),
          });
        } catch (err) {
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
}
