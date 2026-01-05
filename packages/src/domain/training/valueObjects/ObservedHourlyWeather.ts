import { RainFall } from "../../weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../weatherForecast/valueObjects/Temperature";
import { RainfallOccurred } from "./RainfallOccurred";

export interface ObservedHourlyWeatherProps {
  date: string;
  temperature: number;
  rainFall: number;
}

export class ObservedHourlyWeather {
  constructor(
    readonly date: Date,
    readonly temperature: TemperatureCelsius,
    readonly rainfallOccurred: RainfallOccurred,
    readonly rainFall: RainFall
  ) {}
  static create(props: ObservedHourlyWeatherProps): ObservedHourlyWeather {
    if (!props.date || !props.temperature || !props.rainFall) {
      throw new Error("必須項目が不足しています");
    }
    const normalizedDate = new Date(props.date);
    const rainFallMillimeters = RainFall.fromMillimeters(
      props.rainFall
    ).toNumber();
    const rainFallOccurred =
      rainFallMillimeters > 0
        ? RainfallOccurred.occurred()
        : RainfallOccurred.notOccurred();
    return new ObservedHourlyWeather(
      normalizedDate,
      TemperatureCelsius.from(props.temperature),
      rainFallOccurred,
      RainFall.fromMillimeters(props.rainFall)
    );
  }
}
