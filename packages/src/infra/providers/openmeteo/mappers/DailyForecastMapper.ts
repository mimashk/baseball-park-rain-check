import { DailyWeatherForecastDto } from "../../../../application/weatherForecast/dtos/DailyWeatherForecastDto";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { TimeSeriesGenerator } from "../generators/TimeSeriesGenerator";
import { DailyForecastResponse } from "../types/OpenMeteoTypes";

export class DailyForecastMapper {
  static toDto(response: DailyForecastResponse): DailyWeatherForecastDto[] {
    const daily = response.dailyForecast();
    const utcOffsetSeconds = response.utcOffsetSeconds();

    if (!daily)
      throw new InfrastructureError(
        "mapping",
        "Open-Meteo APIのレスポンスにdailyが含まれていません",
        { details: { utcOffsetSeconds } }
      );

    const times = TimeSeriesGenerator.generate({
      timeStartSec: Number(daily.time()),
      timeEndSec: Number(daily.timeEnd()),
      intervalSec: daily.interval(),
      utcOffsetSeconds,
    });

    const weatherCodes = daily.variables(0)!.valuesArray();
    const temperaturesMin = daily.variables(1)!.valuesArray();
    const temperaturesMax = daily.variables(2)!.valuesArray();
    const precipitationProbabilities = daily.variables(3)!.valuesArray();
    const precipitationAmounts = daily.variables(4)!.valuesArray();

    const dtos: DailyWeatherForecastDto[] = [];
    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      const weatherCode = weatherCodes[i];
      const temperatureMin = temperaturesMin[i];
      const temperatureMax = temperaturesMax[i];
      const precipitationProbability = precipitationProbabilities[i];
      const precipitationAmount = precipitationAmounts[i];
      dtos.push({
        date: time,
        weatherCode: weatherCode,
        temperatureMin: temperatureMin,
        temperatureMax: temperatureMax,
        precipitationProbability: precipitationProbability,
        rainFall: precipitationAmount,
      });
    }
    return dtos;
  }
}
