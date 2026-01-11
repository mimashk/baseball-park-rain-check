import { CancellationModelRepository } from "../../../domain/model/repositoryInterface/CancellationModelRepository";
import { BallParkObservedHourlyWeatherRepository } from "../../../domain/training/repositoryInterface/BallParkObservedHourlyWeatherRepository";
import { PastGameRecordRepository } from "../../../domain/training/repositoryInterface/PastGameRecordRepository";
import { TransactionExecutor } from "../../shared/interfaces/TransactionExecutor";
import { RunTrainingPipelineRequest } from "../dtos/RunTrainingPipelineRequest";
import { RunTrainingPipelineResponse } from "../dtos/RunTrainingPipelineResponse";
import { FetchObservedHourlyWeatherService } from "../services/FetchObservedHourlyWeatherService";
import { FetchPastGamesService } from "../services/FetchPastGamesService";
import { TrainModelService } from "../services/TrainModelService";

export class RunTrainingPipelineUseCase {
  constructor(
    private readonly fetchPastGamesService: FetchPastGamesService,
    private readonly fetchObservedHourlyWeatherService: FetchObservedHourlyWeatherService,
    private readonly trainModelService: TrainModelService,
    private readonly pastGameRepository: PastGameRecordRepository,
    private readonly weatherRepository: BallParkObservedHourlyWeatherRepository,
    private readonly modelRepository: CancellationModelRepository,
    private readonly txExecutor: TransactionExecutor
  ) {}

  async execute(
    request: RunTrainingPipelineRequest
  ): Promise<RunTrainingPipelineResponse> {
    const pastGames = await this.fetchPastGamesService.execute(
      request.ballParkId,
      request.from,
      request.to
    );
    const weathers = await this.fetchObservedHourlyWeatherService.execute(
      request.ballParkId,
      request.from,
      request.to
    );
    const model = await this.trainModelService.execute(
      pastGames,
      weathers,
      request.timeWindowBeforeHours,
      request.timeWindowAfterHours
    );
    await this.txExecutor.run(async (trx) => {
      await this.pastGameRepository.withTransaction(trx).upsertMany(pastGames);
      await this.weatherRepository.withTransaction(trx).upsertMany(weathers);
      await this.modelRepository.withTransaction(trx).save(model);
    });
    return {
      message: `${pastGames.length}件のデータを学習しました`,
      model: {
        version: model.version.toString(),
        featureOrder: model.featureOrder.map((feature) => feature.toString()),
        coefficients: model.coefficients,
        intercept: model.intercept,
        trainedCount: pastGames.length,
      },
    };
  }
}
