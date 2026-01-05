import { PrecipitationProbability } from "./PrecipitationProbability";
import { TemperatureCelsius } from "./Temperature";
import { WeatherPattern } from "./WeatherPattern";

export interface DailyWeatherOverviewProps {
  date: string;
  weatherPattern: number;
  temperatureMin: number;
  temperatureMax: number;
  precipitationProbability: number;
}

export class DailyWeatherOverview {
  private constructor(
    readonly date: Date,
    readonly weatherPattern: WeatherPattern,
    readonly temperatureMin: TemperatureCelsius,
    readonly temperatureMax: TemperatureCelsius,
    readonly precipitationProbability: PrecipitationProbability
  ) {}

  static create(props: DailyWeatherOverviewProps): DailyWeatherOverview {
    if (
      !props.date ||
      !props.weatherPattern ||
      !props.temperatureMin ||
      !props.temperatureMax ||
      !props.precipitationProbability
    ) {
      throw new Error("必須項目が不足しています");
    }
    const temperatureMin = TemperatureCelsius.from(props.temperatureMin);
    const temperatureMax = TemperatureCelsius.from(props.temperatureMax);
    if (temperatureMin.toNumber() > temperatureMax.toNumber()) {
      throw new Error("気温の最小値は最大値以下でなければなりません");
    }
    const normalizedDate = new Date(props.date);
    return new DailyWeatherOverview(
      normalizedDate,
      WeatherPattern.fromCode(props.weatherPattern),
      temperatureMin,
      temperatureMax,
      PrecipitationProbability.fromPercent(props.precipitationProbability)
    );
  }
}
