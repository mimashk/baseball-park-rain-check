import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureNonNegativeInteger } from "../../shared/utils/ensureNonNegativeInteger";
import { ensurePositiveInteger } from "../../shared/utils/ensurePositiveInteger";
import { ensureNumberPresent } from "../../shared/utils/ensurePresent";
import { ensureProbability } from "../../shared/utils/ensureProbability";
import { RainFall } from "../../weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../weatherForecast/valueObjects/Temperature";

export class AggregatedPredictionWeatherFeatures {
  private constructor(
    readonly avgTemperature: TemperatureCelsius,
    readonly avgRainFall: RainFall,
    readonly rainOccurRate: number,
    readonly maxRainFall: RainFall,
    readonly hoursAbove1mm: number,
    readonly hoursAbove3mm: number,
    readonly sampleCount: number
  ) {}

  static create(props: {
    avgTemperature: TemperatureCelsius;
    avgRainFall: RainFall;
    rainOccurRate: number;
    maxRainFall: RainFall;
    hoursAbove1mm: number;
    hoursAbove3mm: number;
    sampleCount: number;
  }): AggregatedPredictionWeatherFeatures {
    if (!props.avgTemperature) {
      throw new ValidationError("平均気温は必須です");
    }
    if (!props.avgRainFall) {
      throw new ValidationError("平均降水量は必須です");
    }
    if (!props.maxRainFall) {
      throw new ValidationError("最大降水量は必須です");
    }
    const normalizedRainOccurRate = ensureProbability(
      "降雨発生割合",
      ensureNumberPresent("降雨発生割合", props.rainOccurRate)
    );
    const normalizedHoursAbove1mm = ensureNonNegativeInteger(
      "1mm以上の降雨時間数",
      props.hoursAbove1mm
    );
    const normalizedHoursAbove3mm = ensureNonNegativeInteger(
      "3mm以上の降雨時間数",
      props.hoursAbove3mm
    );
    const normalizedSampleCount = ensurePositiveInteger(
      "サンプル数",
      props.sampleCount
    );

    return new AggregatedPredictionWeatherFeatures(
      props.avgTemperature,
      props.avgRainFall,
      normalizedRainOccurRate,
      props.maxRainFall,
      normalizedHoursAbove1mm,
      normalizedHoursAbove3mm,
      normalizedSampleCount
    );
  }
}
