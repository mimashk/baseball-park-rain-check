import { HourlyWeatherForecastDto } from "../../../../application/prediction/dtos/HourlyWeatherForecastDto";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { TimeSeriesGenerator } from "../generators/TimeSeriesGenerator";
import { HourlyForecastResponse } from "../types/OpenMeteoTypes";

export class HourlyForecastMapper {
  static toDto(response: HourlyForecastResponse): HourlyWeatherForecastDto[] {
    const hourly = response.hourly();
    if (!hourly)
      throw new InfrastructureError(
        "mapping",
        "Open-Meteo APIのレスポンスにhourlyが含まれていません"
      );

    const times = TimeSeriesGenerator.generate({
      timeStartSec: Number(hourly.time()),
      timeEndSec: Number(hourly.timeEnd()),
      intervalSec: hourly.interval(),
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
        weatherCode: weatherCode,
        temperature: temperature,
        precipitationProbability: precipitationProbability / 100,
        rainFall: precipitationAmount,
      });
    }
    return dtos;
  }
}
