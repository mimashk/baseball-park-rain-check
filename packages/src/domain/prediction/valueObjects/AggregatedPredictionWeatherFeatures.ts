import { PrecipitationProbability } from "../../weatherForecast/valueObjects/PrecipitationProbability";
import { RainFall } from "../../weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../weatherForecast/valueObjects/Temperature";
import { FeatureRow } from "../dtos/FeatureRow";

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
    if (!props.avgTemperature) throw new Error("平均気温は必須です");
    if (!props.avgRainFall) throw new Error("平均降水量は必須です");
    if (!props.precipitationProbability) throw new Error("降水確率は必須です");
    if (!Number.isInteger(props.sampleCount) || props.sampleCount <= 0) {
      throw new Error("サンプル数は正の整数でなければなりません");
    }

    return new AggregatedPredictionWeatherFeatures(
      props.avgTemperature,
      props.avgRainFall,
      props.precipitationProbability,
      props.sampleCount
    );
  }

  toPrimitive(): FeatureRow {
    return {
      avgTemperature: this.avgTemperature.toNumber(),
      avgRainFall: this.avgRainFall.toNumber(),
      precipitationProbability: this.precipitationProbability.toPercent() / 100, // 降水確率を0..1に正規化
      sampleCount: this.sampleCount,
    };
  }
}
