import { CancellationModelRepository } from "../../../domain/model/repositoryInterface/CancellationModelRepository";
import { ModelVersion } from "../../../domain/model/valueObjects/ModelVersion";
import { PredictionWeatherFeatureAggregator } from "../../../domain/prediction/services/PredictionWeatherFeatureAggregator";
import { CancellationProbability } from "../../../domain/prediction/valueObjects/CancellationProbability";
import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { GameId } from "../../../domain/scheduledGame/valueObjects/GameId";
import { TimeWindowSpec } from "../../../domain/training/valueObjects/TimeWindowSpec";
import { BallParkHourlyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { DomainError } from "../../../shared/errors/DomainError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { PredictCancellationRequest } from "../dtos/PredictCancellationRequest";
import { PredictCancellationResponse } from "../dtos/PredictCancellationResponse";
import { CancellationPredictor } from "../interfaces/CancellationPredictor";
import { mapAggregatedPredictionWeatherFeaturesToRow } from "../mapper/mapAggregatedPredictionWeatherFeaturesToRow";
import { mapCancellationModelToDto } from "../mapper/mapCancellationModelToDto";

export class PredictCancellationUseCase {
  constructor(
    private readonly gameRepository: ScheduledGameRepository,
    private readonly forecastRepository: BallParkHourlyWeatherForecastRepository,
    private readonly modelRepository: CancellationModelRepository,
    private readonly predictor: CancellationPredictor
  ) {}

  async execute(
    req: PredictCancellationRequest
  ): Promise<PredictCancellationResponse> {
    try {
      const game = await this.gameRepository.findById(
        GameId.fromString(req.gameId)
      );
      if (!game)
        throw new NotFoundError("試合が見つかりません", { gameId: req.gameId });

      const modelVersion = ModelVersion.fromString(req.modelVersion);

      const model = await this.modelRepository.load(modelVersion);
      if (!model)
        throw new NotFoundError("モデルが見つかりません", {
          modelVersion: req.modelVersion,
        });

      const window = TimeWindowSpec.create({
        beforeHours: req.timeWindowBeforeHours,
        afterHours: req.timeWindowAfterHours,
      });
      const { from, to } = window.toRange(game.date);

      const forecasts = await this.forecastRepository.findByDateAndBallPark(
        from,
        to,
        game.ballPark.id()
      );
      if (!forecasts)
        throw new ValidationError("予測に使える気象データがありません", {
          from,
          to,
        });

      const aggregatedFeatures =
        PredictionWeatherFeatureAggregator.aggregate(forecasts);

      const probability = this.predictor.predict({
        model: mapCancellationModelToDto(model),
        features:
          mapAggregatedPredictionWeatherFeaturesToRow(aggregatedFeatures),
      });
      return {
        message: "予測に成功しました",
        probability: CancellationProbability.from(probability).toNumber(),
        modelVersion: req.modelVersion,
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
        gameId: req.gameId,
        modelVersion: req.modelVersion,
      });
    }
  }
}
