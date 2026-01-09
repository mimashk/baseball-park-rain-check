import { HourlyWeatherForecastDto } from "../../../../application/weatherForecast/dtos/HourlyWeatherForecastDto";
import { TimeSeriesGenerator } from "../generators/TimeSeriesGenerator";

export class HourlyForecastMapper {
  static toDto(response: any): HourlyWeatherForecastDto[] {
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

    const weatherCodes = hourly.variables(0)!.valuesArray();
    const temperatures = hourly.variables(1)!.valuesArray();
    const precipitationProbabilities = hourly.variables(2)!.valuesArray();
    const precipitationAmounts = hourly.variables(3)!.valuesArray();

    const dtos: HourlyWeatherForecastDto[] = [];
    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      const weatherCode = weatherCodes[i];
      const temperature = temperatures[i];
      const precipitationProbability = precipitationProbabilities[i];
      const precipitationAmount = precipitationAmounts[i];
      dtos.push({
        date: time,
        weatherPattern: weatherCode,
        temperature: temperature,
        precipitationProbability: precipitationProbability,
        rainFall: precipitationAmount,
      });
    }
    return dtos;
  }
}
