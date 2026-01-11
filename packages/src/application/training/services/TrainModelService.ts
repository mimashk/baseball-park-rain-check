import { CancellationModel } from "../../../domain/model/valueObjects/CancellationModel";
import { TrainingWeatherFeatureAggregator } from "../../../domain/training/services/TrainingWeatherFeatureAggregator";
import { BallParkObservedHourlyWeather } from "../../../domain/training/valueObjects/BallParkObservedHourlyWeather";
import { PastGameRecord } from "../../../domain/training/valueObjects/PastGameRecord";
import { TimeWindowSpec } from "../../../domain/training/valueObjects/TimeWindowSpec";
import { TrainingExample } from "../../../domain/training/valueObjects/TrainingExample";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { CancellationModelTrainer } from "../interfaces/CancellationModelTrainer";
import { mapCancellationModelDtoToProps } from "../mapper/mapCancellationModelDtoToProps";
import { mapTrainingExampleToRow } from "../mapper/mapTrainingExampleToRow";

export class TrainModelService {
  constructor(private readonly trainer: CancellationModelTrainer) {}

  async execute(
    pastGames: PastGameRecord[],
    observedHourlyWeathers: BallParkObservedHourlyWeather[],
    timeWindowBeforeHours: number,
    timeWindowAfterHours: number
  ): Promise<CancellationModel> {
    try {
      const window = TimeWindowSpec.create({
        beforeHours: timeWindowBeforeHours,
        afterHours: timeWindowAfterHours,
      });

      const examples: TrainingExample[] = [];

      for (const game of pastGames) {
        const { from: windowFrom, to: windowTo } = window.toRange(game.date);
        const hourlyWeathers = observedHourlyWeathers.filter((weather) => {
          if (weather.ballParkId !== game.ballPark.id()) return false;
          const weatherDate = weather.date.getTime();
          return (
            weatherDate >= windowFrom.getTime() &&
            weatherDate <= windowTo.getTime()
          );
        });
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
          timeWindowBeforeHours,
          timeWindowAfterHours,
        });
      }

      const modelDto = await this.trainer.train(
        examples.map((e) => mapTrainingExampleToRow(e))
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
