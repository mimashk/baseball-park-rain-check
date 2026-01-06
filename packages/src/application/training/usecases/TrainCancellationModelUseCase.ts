import { CancellationModelRepository } from "../../../domain/model/repositoryInterface/CancellationModelRepository";
import { CancellationModel } from "../../../domain/model/valueObjects/CancellationModel";
import { ModelVersion } from "../../../domain/model/valueObjects/ModelVersion";
import { ObservedHourlyWeatherRepository } from "../../../domain/training/repositoryInterface/ObservedHourlyWeatherRepository";
import { PastGameRecordRepository } from "../../../domain/training/repositoryInterface/PastGameRecordRepository";
import { TrainingWeatherFeatureAggregator } from "../../../domain/training/services/TrainingWeatherFeatureAggregator";
import { TimeWindowSpec } from "../../../domain/training/valueObjects/TimeWindowSpec";
import { TrainingExample } from "../../../domain/training/valueObjects/TrainingExample";
import { TrainCancellationModelRequest } from "../dtos/TrainCancellationModelRequest";
import { TrainCancellationModelResponse } from "../dtos/TrainCancellationModelResponse";
import { CancellationModelTrainer } from "../interfaces/CancellationModelTrainer";

export class TrainCancellationModelUseCase {
  constructor(
    private readonly pastGameRepository: PastGameRecordRepository,
    private readonly weatherRepository: ObservedHourlyWeatherRepository,
    private readonly trainer: CancellationModelTrainer,
    private readonly modelRepository: CancellationModelRepository
  ) {}

  async execute(
    req: TrainCancellationModelRequest
  ): Promise<TrainCancellationModelResponse> {
    const window = TimeWindowSpec.create({
      beforeHours: req.timeWindowBeforeHours,
      afterHours: req.timeWindowAfterHours,
    });

    const pastGames = await this.pastGameRepository.findByDate(
      req.from,
      req.to
    );
    const examples: TrainingExample[] = [];

    for (const game of pastGames) {
      const { from, to } = window.toRange(game.date);
      const hourlyWeathers = await this.weatherRepository.findByDateAndBallPark(
        from,
        to,
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
      throw new Error("学習に使えるデータがありません");
    }

    const modelDto = await this.trainer.train(
      examples.map((e) => e.toPrimitive())
    );
    const model = CancellationModel.create({
      version: ModelVersion.fromDate(modelDto.date),
      featureOrder: modelDto.featureOrder,
      coefficients: modelDto.coefficients,
      intercept: modelDto.intercept,
      mean: modelDto.mean,
      std: modelDto.std,
    });
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
  }
}
