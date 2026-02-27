import { ObservedHourlyWeatherDto } from "../../../../application/training/dtos/ObservedHourlyWeatherDto";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { TimeSeriesGenerator } from "../generators/TimeSeriesGenerator";
import { HourlyObservationResponse } from "../types/OpenMeteoTypes";

export class HourlyObservationMapper {
  static toDto(
    response: HourlyObservationResponse
  ): ObservedHourlyWeatherDto[] {
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
