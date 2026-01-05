import { RainFall } from "../../weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../weatherForecast/valueObjects/Temperature";
import { TrainingKey } from "./TrainingKey";

export class AggregatedTrainingWeatherFeatures {
  private constructor(
    readonly trainingKey: TrainingKey,
    readonly avgTemperature: TemperatureCelsius,
    readonly avgRainFall: RainFall,
    readonly rainOccurRate: number, // 0..1（Window内の雨発生割合）
    readonly sampleCount: number
  ) {}

  static create(props: {
    trainingKey: TrainingKey;
    avgTemperature: TemperatureCelsius;
    avgRainFall: RainFall;
    rainOccurRate: number;
    sampleCount: number;
  }): AggregatedTrainingWeatherFeatures {
    if (!props.trainingKey) throw new Error("トレーニングキーは必須です");
    if (!props.avgTemperature) throw new Error("平均気温は必須です");
    if (!props.avgRainFall) throw new Error("平均降水量は必須です");
    if (
      !Number.isFinite(props.rainOccurRate) ||
      props.rainOccurRate < 0 ||
      props.rainOccurRate > 1
    ) {
      throw new Error("雨発生割合は0から1の間でなければなりません");
    }
    if (!Number.isInteger(props.sampleCount) || props.sampleCount <= 0) {
      throw new Error("サンプル数は正の整数でなければなりません");
    }

    return new AggregatedTrainingWeatherFeatures(
      props.trainingKey,
      props.avgTemperature,
      props.avgRainFall,
      props.rainOccurRate,
      props.sampleCount
    );
  }
}
