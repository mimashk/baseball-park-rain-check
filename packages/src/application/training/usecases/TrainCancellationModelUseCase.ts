import { CancellationModelRepository } from "../../../domain/model/repositoryInterface/CancellationModelRepository";
import { CancellationModel } from "../../../domain/model/valueObjects/CancellationModel";
import { BallParkObservedHourlyWeatherRepository } from "../../../domain/training/repositoryInterface/BallParkObservedHourlyWeatherRepository";
import { PastGameRecordRepository } from "../../../domain/training/repositoryInterface/PastGameRecordRepository";
import { TrainingWeatherFeatureAggregator } from "../../../domain/training/services/TrainingWeatherFeatureAggregator";
import { TimeWindowSpec } from "../../../domain/training/valueObjects/TimeWindowSpec";
import { TrainingExample } from "../../../domain/training/valueObjects/TrainingExample";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDateRange } from "../../shared/utils/ensureValidDateRange";
import { TrainCancellationModelRequest } from "../dtos/TrainCancellationModelRequest";
import { TrainCancellationModelResponse } from "../dtos/TrainCancellationModelResponse";
import { CancellationModelTrainer } from "../interfaces/CancellationModelTrainer";
import { mapCancellationModelDtoToProps } from "../mapper/mapCancellationModelDtoToProps";
import { mapTrainingExampleToRow } from "../mapper/mapTrainingExampleToRow";

export class TrainCancellationModelUseCase {
  constructor(
    private readonly pastGameRepository: PastGameRecordRepository,
    private readonly weatherRepository: BallParkObservedHourlyWeatherRepository,
    private readonly trainer: CancellationModelTrainer,
    private readonly modelRepository: CancellationModelRepository
  ) {}

  async execute(
    req: TrainCancellationModelRequest
  ): Promise<TrainCancellationModelResponse> {
    const { from: normalizedFrom, to: normalizedTo } = ensureValidDateRange(
      "from",
      "to",
      req.from,
      req.to
    );
    try {
      const window = TimeWindowSpec.create({
        beforeHours: req.timeWindowBeforeHours,
        afterHours: req.timeWindowAfterHours,
      });

      const pastGames = await this.pastGameRepository.findByDate(
        normalizedFrom,
        normalizedTo
      );
      const examples: TrainingExample[] = [];

      for (const game of pastGames) {
        const { from: windowFrom, to: windowTo } = window.toRange(game.date);
        const hourlyWeathers =
          await this.weatherRepository.findByDateAndBallPark(
            windowFrom,
            windowTo,
            game.ballPark.id()
          );
        if (!hourlyWeathers.length) continue;

        const features =
          TrainingWeatherFeatureAggregator.aggregate(hourlyWeathers);
        examples.push(
          TrainingExample.create({
            label: game.cancelled,
            features,
          })
        );
      }

      if (examples.length === 0) {
        throw new ValidationError("学習に使えるデータがありません", {
          from: normalizedFrom,
          to: normalizedTo,
        });
      }

      const modelDto = await this.trainer.train(
        examples.map((e) => mapTrainingExampleToRow(e))
      );
      const props = mapCancellationModelDtoToProps(modelDto);
      const model = CancellationModel.create(props);
      await this.modelRepository.save(model);

      return {
        message: `${examples.length}件のデータを学習しました`,
        model: {
          version: model.version.toString(),
          featureOrder: model.featureOrder,
          coefficients: model.coefficients,
          intercept: model.intercept,
          trainedCount: examples.length,
        },
      };
    } catch (err) {
      if (err instanceof DomainError || err instanceof ValidationError)
        throw err;
      throw new DomainError("キャンセルモデルの学習に失敗しました", {
        cause: err,
        from: req.from,
        to: req.to,
      });
    }
  }
}
