import { fetchWeatherApi } from "openmeteo";
import {
  DailyForecastResponse,
  HourlyForecastResponse,
  HourlyObservationResponse,
} from "./types/OpenMeteoTypes";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";
import { ExternalServiceError } from "../../../shared/errors/ExternalServiceError";

export type OpenMeteoAnyResponse = {
  daily?: () => unknown;
  hourly?: () => unknown;
};

export class OpenMeteoClient {
  async fetchDailyForecastFirst(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<DailyForecastResponse> {
    let responses: OpenMeteoAnyResponse[];
    try {
      responses = this.ensureArray(await fetchWeatherApi(url, params));
    } catch (err: unknown) {
      throw new ExternalServiceError("OpenMeteo API呼び出しに失敗しました", {
        cause: err,
        details: { url, params },
      });
    }
    const first = this.ensureNonEmpty(responses);
    if (!first.daily)
      throw new InfrastructureError("mapping", "daily が含まれていません", {
        details: { url, params },
      });
    return first as DailyForecastResponse;
  }

  async fetchHourlyForecastFirst(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<HourlyForecastResponse> {
    let responses: OpenMeteoAnyResponse[];
    try {
      responses = this.ensureArray(await fetchWeatherApi(url, params));
    } catch (err: unknown) {
      throw new ExternalServiceError("OpenMeteo API呼び出しに失敗しました", {
        cause: err,
        details: { url, params },
      });
    }
    const first = this.ensureNonEmpty(responses);
    if (!first.hourly)
      throw new InfrastructureError("mapping", "hourlyが含まれていません", {
        details: { url, params },
      });
    return first as HourlyForecastResponse;
  }

  async fetchHourlyObservationFirst(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<HourlyObservationResponse> {
    let responses: OpenMeteoAnyResponse[];
    try {
      responses = this.ensureArray(await fetchWeatherApi(url, params));
    } catch (err: unknown) {
      throw new ExternalServiceError("OpenMeteo API呼び出しに失敗しました", {
        cause: err,
        details: { url, params },
      });
    }
    const first = this.ensureNonEmpty(responses);
    if (!first.hourly)
      throw new InfrastructureError("mapping", "hourlyが含まれていません", {
        details: { url, params },
      });
    return first as HourlyObservationResponse;
  }

  private ensureArray(responses: unknown): OpenMeteoAnyResponse[] {
    if (!Array.isArray(responses)) {
      throw new InfrastructureError(
        "mapping",
        "OpenMeteo APIのレスポンスが配列ではありません",
        { details: { responses } }
      );
    }
    return responses as OpenMeteoAnyResponse[];
  }

  private ensureNonEmpty<T>(responses: T[]): T {
    if (!responses.length)
      throw new ExternalServiceError("OpenMeteo APIからのレスポンスが空です");
    return responses[0];
  }
}
