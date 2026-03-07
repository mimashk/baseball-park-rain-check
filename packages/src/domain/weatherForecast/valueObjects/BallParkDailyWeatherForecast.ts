import { DomainError } from "../../../shared/errors/DomainError";
import { BallParkId } from "../../scheduledGame/valueObjects/BallPark";
import {
  ensureDatePresent,
  ensureNumberPresent,
} from "../../shared/utils/ensurePresent";
import { PrecipitationProbability } from "./PrecipitationProbability";
import { RainFall } from "./RainFall";
import { TemperatureCelsius } from "./Temperature";
import { WeatherPattern } from "./WeatherPattern";

export interface BallParkDailyWeatherForecastProps {
  date: Date;
  weatherCode: number;
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
    ensureDatePresent("日付", props.date);
    ensureNumberPresent("天気コード", props.weatherCode);
    ensureNumberPresent("気温最大値", props.temperatureMax);
    ensureNumberPresent("気温最小値", props.temperatureMin);
    ensureNumberPresent("降水確率", props.precipitationProbability);
    ensureNumberPresent("降水量", props.rainFall);
    ensureNumberPresent("球場ID", props.ballParkId);
    const temperatureMin = TemperatureCelsius.from(props.temperatureMin);
    const temperatureMax = TemperatureCelsius.from(props.temperatureMax);
    if (temperatureMin.toNumber() > temperatureMax.toNumber()) {
      throw new DomainError("気温の最小値は最大値以下でなければなりません");
    }
    const normalizedDate = new Date(props.date);
    return new BallParkDailyWeatherForecast(
      normalizedDate,
      WeatherPattern.fromCode(props.weatherCode),
      temperatureMin,
      temperatureMax,
      PrecipitationProbability.fromRate(props.precipitationProbability),
      RainFall.fromMillimeters(props.rainFall),
      props.ballParkId
    );
  }
}
