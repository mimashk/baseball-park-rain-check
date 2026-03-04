import { CancellationModelRepository } from "../../../domain/model/repositoryInterface/CancellationModelRepository";
import {
  BallParkId,
  openAirParks,
} from "../../../domain/scheduledGame/valueObjects/BallPark";
import { RunTrainingPipelineRequest } from "../dtos/RunTrainingPipelineRequest";
import { RunTrainingPipelineResponse } from "../dtos/RunTrainingPipelineResponse";
import { FetchObservedHourlyWeatherService } from "../services/FetchObservedHourlyWeatherService";
import { FetchPastGamesService } from "../services/FetchPastGamesService";
import { TrainModelService } from "../services/TrainModelService";

interface TrainingPipelineResult {
  version: string;
  ballParkId: BallParkId;
  featureOrder: string[];
  coefficients: number[];
  intercept: number;
  trainedCount: number;
}

export class RunTrainingPipelineUseCase {
  constructor(
    private readonly fetchPastGamesService: FetchPastGamesService,
    private readonly fetchObservedHourlyWeatherService: FetchObservedHourlyWeatherService,
    private readonly trainModelService: TrainModelService,
    private readonly modelRepository: CancellationModelRepository
  ) {}

  async execute(
    request: RunTrainingPipelineRequest
  ): Promise<RunTrainingPipelineResponse> {
    const openAirBallParks = openAirParks();
    const pastGames = await this.fetchPastGamesService.execute(
      request.from,
      request.to
    );
    console.log("pastGamesが取得完了");

    const results: TrainingPipelineResult[] = [];
    for (const ballPark of openAirBallParks) {
      const ballParkId = ballPark.id();
      const weathers = await this.fetchObservedHourlyWeatherService.execute(
        ballParkId,
        request.from,
        request.to
      );
      const gamesForBallPark = pastGames.filter(
        (g) => g.ballPark.id() === ballParkId
      );
      if (!gamesForBallPark.length || !weathers.length) continue;

      const model = await this.trainModelService.execute(
        gamesForBallPark,
        weathers,
        request.timeWindowBeforeHours,
        request.timeWindowAfterHours,
        ballParkId
      );
      await this.modelRepository.save(model);
      results.push({
        version: model.version.toString(),
        ballParkId: model.ballParkId,
        featureOrder: model.featureOrder.map((feature) => feature.toString()),
        coefficients: model.coefficients,
        intercept: model.intercept,
        trainedCount: pastGames.length,
      });
    }
    return {
      message: `${results.length}球場の学習が完了しました`,
      results: results.map((result) => ({
        version: result.version,
        ballParkId: result.ballParkId,
        featureOrder: result.featureOrder,
        coefficients: result.coefficients,
        intercept: result.intercept,
        trainedCount: result.trainedCount,
      })),
    };
  }
}
