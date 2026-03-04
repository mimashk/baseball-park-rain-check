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
    // 1) 同一点・同日の重複を除去
    const uniquePoints = Array.from(
      new Map(
        points.map((p) => [
          `${this.toJstDateKey(p.date)}::${p.latitude}::${p.longitude}`,
          p,
        ])
      ).values()
    );

    // 2) 並列数を制限
    const CONCURRENCY = 3;
    const results: DailyWeatherForecastDto[][] = new Array(uniquePoints.length);
    let cursor = 0;

    const worker = async () => {
      while (true) {
        const i = cursor++;
        if (i >= uniquePoints.length) return;
        const point = uniquePoints[i];
        const date = this.toJstDateKey(point.date);

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
        results[i] = DailyForecastMapper.toDto(res);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, uniquePoints.length) }, () =>
        worker()
      )
    );

    return results.flat();
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
    const startDate = this.toJstDateKey(from);
    const endDate = this.toJstDateKey(to);
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

  private readonly jstDateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  private toJstDateKey(date: Date): string {
    const parts = this.jstDateFormatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (!year || !month || !day) throw new Error("Failed to format JST date");
    return `${year}-${month}-${day}`;
  }
}
