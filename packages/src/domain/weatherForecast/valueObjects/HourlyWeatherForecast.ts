import { PrecipitationProbability } from "./PrecipitationProbability";
import { RainFall } from "./RainFall";
import { TemperatureCelsius } from "./Temperature";
import { WeatherPattern } from "./WeatherPattern";

export interface HourlyWeatherForecastProps {
  date: string;
  weatherPattern: number;
  temperature: number;
  precipitationProbability: number;
  rainFall: number;
}

export class HourlyWeatherForecast {
  constructor(
    readonly date: Date,
    readonly weatherPattern: WeatherPattern,
    readonly temperature: TemperatureCelsius,
    readonly precipitationProbability: PrecipitationProbability,
    readonly rainFall: RainFall
  ) {}
  static create(props: HourlyWeatherForecastProps): HourlyWeatherForecast {
    if (
      !props.date ||
      !props.weatherPattern ||
      !props.temperature ||
      !props.precipitationProbability ||
      !props.rainFall
    ) {
      throw new Error("必須項目が不足しています");
    }
    const normalizedDate = new Date(props.date);
    return new HourlyWeatherForecast(
      normalizedDate,
      WeatherPattern.fromCode(props.weatherPattern),
      TemperatureCelsius.from(props.temperature),
      PrecipitationProbability.fromPercent(props.precipitationProbability),
      RainFall.fromMillimeters(props.rainFall)
    );
  }
}
