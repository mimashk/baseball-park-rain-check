import { ObservedHourlyWeatherDto } from "../../../application/training/dtos/ObservedHourlyWeatherDto";
import { ObservedHourlyWeatherProvider } from "../../../application/training/interfaces/ObservedHourlyWeatherProvider";
import { DailyWeatherForecastDto } from "../../../application/refresher/dtos/DailyWeatherForecastDto";
import { HourlyWeatherForecastDto } from "../../../application/prediction/dtos/HourlyWeatherForecastDto";
import {
  DailyForecastPoint,
  DailyWeatherForecastProvider,
} from "../../../application/refresher/interfaces/DailyWeatherForecastProvider";
import { HourlyWeatherForecastProvider } from "../../../application/prediction/interfaces/HourlyWeatherForecastProvider";
import { DailyForecastMapper } from "./mappers/DailyForecastMapper";
import { HourlyForecastMapper } from "./mappers/HourlyForecastMapper";
import { HourlyObservationMapper } from "./mappers/HourlyObservationMapper";
import { OpenMeteoClient } from "./OpenMeteoClient";
import { OpenMeteoEndpoints } from "./OpenMeteoEndpoints";
import { OpenMeteoParamsGenerator } from "./generators/OpenMeteoParamsGenerator";

export class OpenMeteoWeatherProvider
  implements
    DailyWeatherForecastProvider,
    HourlyWeatherForecastProvider,
    ObservedHourlyWeatherProvider
{
  constructor(private readonly client: OpenMeteoClient) {}

  async fetchDailyForecasts(
    points: DailyForecastPoint[]
  ): Promise<DailyWeatherForecastDto[]> {
    const tasks = points.map(async (point) => {
      const date = point.date.toISOString().split("T")[0];
      const params = OpenMeteoParamsGenerator.buildDailyForecast({
        latitude: point.latitude,
        longitude: point.longitude,
        startDate: date,
        endDate: date,
      });
      const res = await this.client.fetchDailyForecastFirst(
        OpenMeteoEndpoints.FORECAST,
        params
      );
      return DailyForecastMapper.toDto(res);
    });
    return (await Promise.all(tasks)).flat();
  }

  async fetchHourlyForecasts(
    latitude: number,
    longitude: number,
    forecastDays: number
  ): Promise<HourlyWeatherForecastDto[]> {
    const params = OpenMeteoParamsGenerator.buildHourlyForecast({
      latitude,
      longitude,
      forecastDays,
    });
    const res = await this.client.fetchHourlyForecastFirst(
      OpenMeteoEndpoints.FORECAST,
      params
    );
    return HourlyForecastMapper.toDto(res);
  }

  async fetchHourlyObservations(
    latitude: number,
    longitude: number,
    from: Date,
    to: Date
  ): Promise<ObservedHourlyWeatherDto[]> {
    const startDate = from.toISOString().split("T")[0];
    const endDate = to.toISOString().split("T")[0];
    const params = OpenMeteoParamsGenerator.buildHourlyArchive({
      latitude,
      longitude,
      startDate,
      endDate,
    });
    const res = await this.client.fetchHourlyObservationFirst(
      OpenMeteoEndpoints.ARCHIVE,
      params
    );
    return HourlyObservationMapper.toDto(res);
  }
}
