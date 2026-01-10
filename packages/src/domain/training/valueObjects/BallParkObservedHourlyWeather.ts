import { BallParkId } from "../../scheduledGame/valueObjects/BallPark";
import { ensureNumberPresent } from "../../shared/ensurePresent";
import { ensureValidDate } from "../../shared/ensureValidDate";
import { RainFall } from "../../weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../weatherForecast/valueObjects/Temperature";
import { RainfallOccurred } from "./RainfallOccurred";

export interface BallParkObservedHourlyWeatherProps {
  date: Date;
  temperature: number;
  rainFall: number;
  ballParkId: BallParkId;
}

export class BallParkObservedHourlyWeather {
  constructor(
    readonly date: Date,
    readonly temperature: TemperatureCelsius,
    readonly rainfallOccurred: RainfallOccurred,
    readonly rainFall: RainFall,
    readonly ballParkId: BallParkId
  ) {}
  static create(
    props: BallParkObservedHourlyWeatherProps
  ): BallParkObservedHourlyWeather {
    const normalizedDate = ensureValidDate("日付", props.date);
    const normalizedTemperature = ensureNumberPresent(
      "気温",
      props.temperature
    );
    const normalizedRainFall = ensureNumberPresent("降水量", props.rainFall);
    if (!props.ballParkId) throw new Error("球場IDは必須です");
    const rainFallMillimeters = RainFall.fromMillimeters(
      props.rainFall
    ).toNumber();
    const rainFallOccurred =
      rainFallMillimeters > 0
        ? RainfallOccurred.occurred()
        : RainfallOccurred.notOccurred();
    return new BallParkObservedHourlyWeather(
      normalizedDate,
      TemperatureCelsius.from(normalizedTemperature),
      rainFallOccurred,
      RainFall.fromMillimeters(normalizedRainFall),
      props.ballParkId
    );
  }
}
