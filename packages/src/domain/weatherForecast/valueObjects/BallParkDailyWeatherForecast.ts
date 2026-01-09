import {
  BallPark,
  BallParkId,
} from "../../scheduledGame/valueObjects/BallPark";
import { PrecipitationProbability } from "./PrecipitationProbability";
import { RainFall } from "./RainFall";
import { TemperatureCelsius } from "./Temperature";
import { WeatherPattern } from "./WeatherPattern";

export interface BallParkDailyWeatherForecastProps {
  date: Date;
  weatherPattern: number;
  temperatureMin: number;
  temperatureMax: number;
  precipitationProbability: number;
  rainFall: number;
  ballParkId: BallParkId;
}

export class BallParkDailyWeatherForecast {
  private constructor(
    readonly date: Date,
    readonly weatherPattern: WeatherPattern,
    readonly temperatureMin: TemperatureCelsius,
    readonly temperatureMax: TemperatureCelsius,
    readonly precipitationProbability: PrecipitationProbability,
    readonly rainFall: RainFall,
    readonly ballParkId: BallParkId
  ) {}

  static create(
    props: BallParkDailyWeatherForecastProps
  ): BallParkDailyWeatherForecast {
    if (
      !props.date ||
      !props.weatherPattern ||
      !props.temperatureMin ||
      !props.temperatureMax ||
      !props.precipitationProbability ||
      !props.rainFall ||
      !props.ballParkId
    ) {
      throw new Error("必須項目が不足しています");
    }
    const temperatureMin = TemperatureCelsius.from(props.temperatureMin);
    const temperatureMax = TemperatureCelsius.from(props.temperatureMax);
    if (temperatureMin.toNumber() > temperatureMax.toNumber()) {
      throw new Error("気温の最小値は最大値以下でなければなりません");
    }
    const normalizedDate = new Date(props.date);
    return new BallParkDailyWeatherForecast(
      normalizedDate,
      WeatherPattern.fromCode(props.weatherPattern),
      temperatureMin,
      temperatureMax,
      PrecipitationProbability.fromPercent(props.precipitationProbability),
      RainFall.fromMillimeters(props.rainFall),
      props.ballParkId
    );
  }
}
