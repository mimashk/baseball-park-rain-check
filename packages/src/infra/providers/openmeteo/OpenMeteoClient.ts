import { fetchWeatherApi } from "openmeteo";
import {
  DailyForecastResponse,
  HourlyForecastResponse,
  HourlyObservationResponse,
} from "./types/OpenMeteoTypes";

export type OpenMeteoAnyResponse = {
  daily?: () => unknown;
  hourly?: () => unknown;
};

export class OpenMeteoClient {
  async fetchDailyForecastFirst(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<DailyForecastResponse> {
    const responses = this.ensureArray(await fetchWeatherApi(url, params));
    const first = this.ensureNonEmpty(responses);
    if (!first.daily) throw new Error("dailyが含まれていません");
    return first as DailyForecastResponse;
  }

  async fetchHourlyForecastFirst(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<HourlyForecastResponse> {
    const responses = this.ensureArray(await fetchWeatherApi(url, params));
    const first = this.ensureNonEmpty(responses);
    if (!first.hourly) throw new Error("hourlyが含まれていません");
    return first as HourlyForecastResponse;
  }

  async fetchHourlyObservationFirst(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<HourlyObservationResponse> {
    const responses = this.ensureArray(await fetchWeatherApi(url, params));
    const first = this.ensureNonEmpty(responses);
    if (!first.hourly) throw new Error("hourlyが含まれていません");
    return first as HourlyObservationResponse;
  }

  private ensureArray(responses: unknown): OpenMeteoAnyResponse[] {
    if (!Array.isArray(responses)) {
      throw new Error("OpenMeteo APIのレスポンスが配列ではありません");
    }
    return responses as OpenMeteoAnyResponse[];
  }

  private ensureNonEmpty<T>(responses: T[]): T {
    if (!responses.length)
      throw new Error("OpenMeteo APIからのレスポンスが空です");
    return responses[0];
  }
}
