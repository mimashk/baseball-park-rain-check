import { ObservedHourlyWeatherDto } from "../../../../application/training/dtos/ObservedHourlyWeatherDto";
import { HourlyWeatherForecastDto } from "../../../../application/weatherForecast/dtos/HourlyWeatherForecastDto";
import { TimeSeriesGenerator } from "../generators/TimeSeriesGenerator";

export class HourlyObservationMapper {
  static toDto(response: any): ObservedHourlyWeatherDto[] {
    const hourly = response.hourly();
    if (!hourly)
      throw new Error("Open-Meteo APIのレスポンスにhourlyが含まれていません");

    const utcOffsetSeconds = response.utcOffsetSeconds();

    const times = TimeSeriesGenerator.generate({
      timeStartSec: Number(hourly.time()),
      timeEndSec: Number(hourly.timeEnd()),
      intervalSec: hourly.interval(),
      utcOffsetSeconds,
    });

    const temperatures = hourly.variables(0)!.valuesArray();
    const precipitationAmounts = hourly.variables(1)!.valuesArray();

    const dtos: ObservedHourlyWeatherDto[] = [];
    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      const temperature = temperatures[i];
      const precipitationAmount = precipitationAmounts[i];
      dtos.push({
        date: time,
        temperature: temperature,
        rainFall: precipitationAmount,
      });
    }
    return dtos;
  }
}
