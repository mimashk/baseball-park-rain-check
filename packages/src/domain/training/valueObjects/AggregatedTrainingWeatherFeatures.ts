import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureNonNegativeInteger } from "../../shared/utils/ensureNonNegativeInteger";
import { ensureNumberPresent } from "../../shared/utils/ensurePresent";
import { ensureProbability } from "../../shared/utils/ensureProbability";
import { RainFall } from "../../weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../weatherForecast/valueObjects/Temperature";

export class AggregatedTrainingWeatherFeatures {
  private constructor(
    readonly avgTemperature: TemperatureCelsius,
    readonly avgRainFall: RainFall,
    readonly rainOccurRate: number, // 0..1（Window内の雨発生割合）
    readonly maxRainFall: RainFall,
    readonly hoursAbove1mm: number,
    readonly hoursAbove3mm: number
  ) {}

  static create(props: {
    avgTemperature: TemperatureCelsius;
    avgRainFall: RainFall;
    rainOccurRate: number;
    maxRainFall: RainFall;
    hoursAbove1mm: number;
    hoursAbove3mm: number;
  }): AggregatedTrainingWeatherFeatures {
    if (!props.avgTemperature) {
      throw new ValidationError("平均気温は必須です");
    }
    if (!props.avgRainFall) {
      throw new ValidationError("平均降水量は必須です");
    }
    if (!props.maxRainFall) {
      throw new ValidationError("最大降水量は必須です");
    }
    const normalizedRainOccurRate = ensureNumberPresent(
      "降水確率",
      props.rainOccurRate
    );
    const normalizedRainOccurProbability = ensureProbability(
      "降水確率",
      normalizedRainOccurRate
    );
    const normalizedHoursAbove1mm = ensureNonNegativeInteger(
      "1mm以上の降雨時間数",
      props.hoursAbove1mm
    );
    const normalizedHoursAbove3mm = ensureNonNegativeInteger(
      "3mm以上の降雨時間数",
      props.hoursAbove3mm
    );
    return new AggregatedTrainingWeatherFeatures(
      props.avgTemperature,
      props.avgRainFall,
      normalizedRainOccurProbability,
      props.maxRainFall,
      normalizedHoursAbove1mm,
      normalizedHoursAbove3mm
    );
  }
}
