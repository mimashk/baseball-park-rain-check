import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensurePositiveInteger } from "../../shared/utils/ensurePositiveInteger";
import { PrecipitationProbability } from "../../weatherForecast/valueObjects/PrecipitationProbability";
import { RainFall } from "../../weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../weatherForecast/valueObjects/Temperature";

export class AggregatedPredictionWeatherFeatures {
  private constructor(
    readonly avgTemperature: TemperatureCelsius,
    readonly avgRainFall: RainFall,
    readonly precipitationProbability: PrecipitationProbability,
    readonly sampleCount: number
  ) {}

  static create(props: {
    avgTemperature: TemperatureCelsius;
    avgRainFall: RainFall;
    precipitationProbability: PrecipitationProbability;
    sampleCount: number;
  }): AggregatedPredictionWeatherFeatures {
    if (!props.avgTemperature) {
      throw new ValidationError("平均気温は必須です");
    }
    if (!props.avgRainFall) {
      throw new ValidationError("平均降水量は必須です");
    }
    if (!props.precipitationProbability) {
      throw new ValidationError("降水確率は必須です");
    }
    const normalizedSampleCount = ensurePositiveInteger(
      "サンプル数",
      props.sampleCount
    );

    return new AggregatedPredictionWeatherFeatures(
      props.avgTemperature,
      props.avgRainFall,
      props.precipitationProbability,
      normalizedSampleCount
    );
  }
}
