import { BallParkId } from "../../scheduledGame/valueObjects/BallPark";
import {
  ensureDatePresent,
  ensureNumberPresent,
} from "../../shared/ensurePresent";
import { PrecipitationProbability } from "./PrecipitationProbability";
import { RainFall } from "./RainFall";
import { TemperatureCelsius } from "./Temperature";
import { WeatherPattern } from "./WeatherPattern";

export interface BallParkHourlyWeatherForecastProps {
  date: Date;
  weatherCode: number;
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
    ensureDatePresent("日付", props.date);
    ensureNumberPresent("天気コード", props.weatherCode);
    ensureNumberPresent("気温", props.temperature);
    ensureNumberPresent("降水確率", props.precipitationProbability);
    ensureNumberPresent("降水量", props.rainFall);
    ensureNumberPresent("球場ID", props.ballParkId);
    return new BallParkHourlyWeatherForecast(
      ensureDatePresent("日付", props.date),
      WeatherPattern.fromCode(props.weatherCode),
      TemperatureCelsius.from(props.temperature),
      PrecipitationProbability.fromPercent(props.precipitationProbability),
      RainFall.fromMillimeters(props.rainFall),
      props.ballParkId
    );
  }
}
