import { ValidationError } from "../../../shared/errors/ValidationError";
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
    readonly sampleCount: number
  ) {}

  static create(props: {
    avgTemperature: TemperatureCelsius;
    avgRainFall: RainFall;
    rainOccurRate: number;
    sampleCount: number;
  }): AggregatedPredictionWeatherFeatures {
    if (!props.avgTemperature) {
      throw new ValidationError("平均気温は必須です");
    }
    if (!props.avgRainFall) {
      throw new ValidationError("平均降水量は必須です");
    }
    const normalizedRainOccurRate = ensureProbability(
      "降雨発生割合",
      ensureNumberPresent("降雨発生割合", props.rainOccurRate)
    );
    const normalizedSampleCount = ensurePositiveInteger(
      "サンプル数",
      props.sampleCount
    );

    return new AggregatedPredictionWeatherFeatures(
      props.avgTemperature,
      props.avgRainFall,
      normalizedRainOccurRate,
      normalizedSampleCount
    );
  }
}
