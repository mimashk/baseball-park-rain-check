import { CancellationModelRepository } from "../../../domain/model/repositoryInterface/CancellationModelRepository";
import { PredictionWeatherFeatureAggregator } from "../../../domain/prediction/services/PredictionWeatherFeatureAggregator";
import { CancellationProbability } from "../../../domain/prediction/valueObjects/CancellationProbability";
import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { GameId } from "../../../domain/scheduledGame/valueObjects/GameId";
import { TimeWindowSpec } from "../../../domain/training/valueObjects/TimeWindowSpec";
import { BallParkHourlyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { PredictCancellationRequest } from "../dtos/PredictCancellationRequest";
import { PredictCancellationResponse } from "../dtos/PredictCancellationResponse";
import { CancellationPredictor } from "../interfaces/CancellationPredictor";
import { mapAggregatedPredictionWeatherFeaturesToRow } from "../mapper/mapAggregatedPredictionWeatherFeaturesToRow";

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
    const game = await this.gameRepository.findById(
      GameId.fromString(req.gameId)
    );
    if (!game) throw new Error(`試合が見つかりません: ${req.gameId}`);

    const model = await this.modelRepository.load(req.modelVersion);
    if (!model) throw new Error(`モデルが見つかりません: ${req.modelVersion}`);

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
    if (!forecasts) throw new Error("予測に使える気象データがありません");

    const aggregatedFeatures =
      PredictionWeatherFeatureAggregator.aggregate(forecasts);

    const probability = this.predictor.predict({
      model: model.toPrimitive(),
      features: mapAggregatedPredictionWeatherFeaturesToRow(aggregatedFeatures),
    });
    return {
      message: "予測に成功しました",
      probability: CancellationProbability.from(probability).toNumber(),
      modelVersion: req.modelVersion,
    };
  }
}
