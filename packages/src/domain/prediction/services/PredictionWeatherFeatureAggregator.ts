import { ValidationError } from "../../../shared/errors/ValidationError";
import { BallParkHourlyWeatherForecast } from "../../weatherForecast/valueObjects/BallParkHourlyWeatherForecast";
import { RainFall } from "../../weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../weatherForecast/valueObjects/Temperature";
import { AggregatedPredictionWeatherFeatures } from "../valueObjects/AggregatedPredictionWeatherFeatures";

export class PredictionWeatherFeatureAggregator {
  static aggregate(
    hourly: BallParkHourlyWeatherForecast[]
  ): AggregatedPredictionWeatherFeatures {
    if (!hourly || hourly.length === 0) {
      throw new ValidationError("気象予報データがありません");
    }

    const avgTemp = this.avg(hourly.map((h) => h.temperature.toNumber()));
    const avgRain = this.avg(hourly.map((h) => h.rainFall.toNumber()));
    const rainOccurRate = this.avg(
      hourly.map((h) => (h.rainFall.toNumber() > 0 ? 1 : 0))
    );

    return AggregatedPredictionWeatherFeatures.create({
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
