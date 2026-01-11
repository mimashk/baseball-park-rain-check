import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensurePositiveInteger } from "../../shared/utils/ensurePositiveInteger";
import { ensureNumberPresent } from "../../shared/utils/ensurePresent";
import { ensureProbability } from "../../shared/utils/ensureProbability";
import { RainFall } from "../../weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../weatherForecast/valueObjects/Temperature";

export class AggregatedTrainingWeatherFeatures {
  private constructor(
    readonly avgTemperature: TemperatureCelsius,
    readonly avgRainFall: RainFall,
    readonly rainOccurRate: number // 0..1（Window内の雨発生割合）
  ) {}

  static create(props: {
    avgTemperature: TemperatureCelsius;
    avgRainFall: RainFall;
    rainOccurRate: number;
  }): AggregatedTrainingWeatherFeatures {
    if (!props.avgTemperature) {
      throw new ValidationError("平均気温は必須です");
    }
    if (!props.avgRainFall) {
      throw new ValidationError("平均降水量は必須です");
    }
    const normalizedRainOccurRate = ensureNumberPresent(
      "降水確率",
      props.rainOccurRate
    );
    const normalizedRainOccurProbability = ensureProbability(
      "降水確率",
      normalizedRainOccurRate
    );
    return new AggregatedTrainingWeatherFeatures(
      props.avgTemperature,
      props.avgRainFall,
      normalizedRainOccurProbability
    );
  }
}
