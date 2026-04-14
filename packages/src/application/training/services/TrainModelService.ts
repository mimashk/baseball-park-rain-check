import { CancellationModel } from "../../../domain/model/valueObjects/CancellationModel";
import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkObservedHourlyWeather } from "../../../domain/training/valueObjects/BallParkObservedHourlyWeather";
import { PastGameRecord } from "../../../domain/training/valueObjects/PastGameRecord";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { CancellationModelTrainer } from "../interfaces/CancellationModelTrainer";
import { mapCancellationModelDtoToProps } from "../mapper/mapCancellationModelDtoToProps";
import { mapTrainingDatasetRowToTrainingRow } from "../mapper/mapTrainingDatasetRowToTrainingRow";
import { BuildTrainingDatasetService } from "./BuildTrainingDatasetService";

export class TrainModelService {
  constructor(
    private readonly trainer: CancellationModelTrainer,
    private readonly buildTrainingDatasetService: BuildTrainingDatasetService
  ) {}

  async execute(
    pastGames: PastGameRecord[],
    observedHourlyWeathers: BallParkObservedHourlyWeather[],
    timeWindowBeforeHours: number,
    timeWindowAfterHours: number,
    ballParkId: BallParkId
  ): Promise<CancellationModel> {
    try {
      const datasetRows = this.buildTrainingDatasetService.execute(
        pastGames,
        observedHourlyWeathers,
        timeWindowBeforeHours,
        timeWindowAfterHours
      );

      const modelDto = await this.trainer.train(
        datasetRows.map((row) => mapTrainingDatasetRowToTrainingRow(row)),
        ballParkId
      );
      const props = mapCancellationModelDtoToProps(modelDto);
      const model = CancellationModel.create(props);

      return model;
    } catch (err) {
      if (err instanceof DomainError || err instanceof ValidationError)
        throw err;
      throw new DomainError("キャンセルモデルの学習に失敗しました", {
        cause: err,
        timeWindowBeforeHours,
        timeWindowAfterHours,
      });
    }
  }
}
