import { ValidationError } from "../../../shared/errors/ValidationError";
import { RainFall } from "../../weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../weatherForecast/valueObjects/Temperature";
import { AggregatedTrainingWeatherFeatures } from "../valueObjects/AggregatedTrainingWeatherFeatures";
import { BallParkObservedHourlyWeather } from "../valueObjects/BallParkObservedHourlyWeather";

export class TrainingWeatherFeatureAggregator {
  static aggregate(
    hourly: BallParkObservedHourlyWeather[]
  ): AggregatedTrainingWeatherFeatures {
    if (!hourly || hourly.length === 0) {
      throw new ValidationError("観測された気象データがありません");
    }

    const avgTemp = this.avg(hourly.map((h) => h.temperature.toNumber()));
    const avgRain = this.avg(hourly.map((h) => h.rainFall.toNumber()));
    const rainOccurRate = this.avg(
      hourly.map((h) => h.rainfallOccurred.toNumber())
    );

    return AggregatedTrainingWeatherFeatures.create({
      avgTemperature: TemperatureCelsius.from(avgTemp),
      avgRainFall: RainFall.fromMillimeters(avgRain),
      rainOccurRate,
      sampleCount: hourly.length,
    });
  }

  private static avg(values: number[]): number {
    const finite = values.filter((v) => Number.isFinite(v));
    if (finite.length === 0) {
      throw new ValidationError("平均値を計算できません", { values });
    }
    return finite.reduce((acc, value) => acc + value, 0) / finite.length;
  }
}
