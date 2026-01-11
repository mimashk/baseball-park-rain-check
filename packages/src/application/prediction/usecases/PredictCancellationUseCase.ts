import { CancellationModelRepository } from "../../../domain/model/repositoryInterface/CancellationModelRepository";
import { PredictionWeatherFeatureAggregator } from "../../../domain/prediction/services/PredictionWeatherFeatureAggregator";
import { CancellationProbability } from "../../../domain/prediction/valueObjects/CancellationProbability";
import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { GameId } from "../../../domain/scheduledGame/valueObjects/GameId";
import { TimeWindowSpec } from "../../../domain/training/valueObjects/TimeWindowSpec";
import { DomainError } from "../../../shared/errors/DomainError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { RefreshHourlyWeatherForecastsService } from "../../weatherForecast/services/RefreshHourlyWeatherForecastsService";
import { PredictCancellationRequest } from "../dtos/PredictCancellationRequest";
import { PredictCancellationResponse } from "../dtos/PredictCancellationResponse";
import { CancellationPredictor } from "../interfaces/CancellationPredictor";
import { mapAggregatedPredictionWeatherFeaturesToRow } from "../mapper/mapAggregatedPredictionWeatherFeaturesToRow";
import { mapCancellationModelToDto } from "../mapper/mapCancellationModelToDto";

export class PredictCancellationUseCase {
  constructor(
    private readonly gameRepository: ScheduledGameRepository,
    private readonly refreshHourlyWeatherForecastsService: RefreshHourlyWeatherForecastsService,
    private readonly modelRepository: CancellationModelRepository,
    private readonly predictor: CancellationPredictor
  ) {}

  async execute(
    req: PredictCancellationRequest
  ): Promise<PredictCancellationResponse> {
    try {
      const games = await this.gameRepository.findAtDate(req.todayDate);
      if (games.length === 0)
        throw new NotFoundError("今日の試合が見つかりません");
      // 一旦1試合のみなので先頭を取得
      const game = games[0];
      if (!game) throw new NotFoundError("今日の試合が見つかりません");

      const model = await this.modelRepository.findLatest();
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

      const hourlyWeatherForecasts =
        await this.refreshHourlyWeatherForecastsService.execute(
          game.ballPark.id(),
          req.forecastDays
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

      const aggregatedFeatures = PredictionWeatherFeatureAggregator.aggregate(
        filteredHourlyWeatherForecasts
      );

      const probability = this.predictor.predict({
        model: mapCancellationModelToDto(model),
        features:
          mapAggregatedPredictionWeatherFeaturesToRow(aggregatedFeatures),
      });
      return {
        message: "予測に成功しました",
        probability: CancellationProbability.from(probability).toNumber(),
        modelVersion: model.version.toString(),
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
