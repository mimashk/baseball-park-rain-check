import {
  BallPark,
  BallParkId,
} from "../../scheduledGame/valueObjects/BallPark";
import { PrecipitationProbability } from "./PrecipitationProbability";
import { RainFall } from "./RainFall";
import { TemperatureCelsius } from "./Temperature";
import { WeatherPattern } from "./WeatherPattern";

export interface BallParkHourlyWeatherForecastProps {
  date: Date;
  weatherPattern: number;
  temperature: number;
  precipitationProbability: number;
  rainFall: number;
  ballParkId: BallParkId;
}

export class BallParkHourlyWeatherForecast {
  constructor(
    readonly date: Date,
    readonly weatherPattern: WeatherPattern,
    readonly temperature: TemperatureCelsius,
    readonly precipitationProbability: PrecipitationProbability,
    readonly rainFall: RainFall,
    readonly ballParkId: BallParkId
  ) {}
  static create(
    props: BallParkHourlyWeatherForecastProps
  ): BallParkHourlyWeatherForecast {
    if (
      !props.date ||
      !props.weatherPattern ||
      !props.temperature ||
      !props.precipitationProbability ||
      !props.rainFall ||
      !props.ballParkId
    ) {
      throw new Error("必須項目が不足しています");
    }
    const normalizedDate = new Date(props.date);
    return new BallParkHourlyWeatherForecast(
      normalizedDate,
      WeatherPattern.fromCode(props.weatherPattern),
      TemperatureCelsius.from(props.temperature),
      PrecipitationProbability.fromPercent(props.precipitationProbability),
      RainFall.fromMillimeters(props.rainFall),
      props.ballParkId
    );
  }
}
