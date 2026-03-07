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

const RETRYABLE_ERROR_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "EAI_AGAIN",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 300;
const MAX_DELAY_MS = 3_000;
const JITTER_RATE = 0.3;

export class OpenMeteoClient {
  async fetchDailyForecastFirst(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<DailyForecastResponse> {
    const responses = await this.fetchWithRetry(url, params);
    const first = this.ensureNonEmpty(responses);
    if (!first.daily) {
      throw new InfrastructureError("mapping", "daily が含まれていません", {
        details: { url, params },
      });
    }
    return first as DailyForecastResponse;
  }

  async fetchHourlyForecastFirst(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<HourlyForecastResponse> {
    const responses = await this.fetchWithRetry(url, params);
    const first = this.ensureNonEmpty(responses);
    if (!first.hourly) {
      throw new InfrastructureError("mapping", "hourlyが含まれていません", {
        details: { url, params },
      });
    }
    return first as HourlyForecastResponse;
  }

  async fetchHourlyObservationFirst(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<HourlyObservationResponse> {
    const responses = await this.fetchWithRetry(url, params);
    const first = this.ensureNonEmpty(responses);
    if (!first.hourly) {
      throw new InfrastructureError("mapping", "hourlyが含まれていません", {
        details: { url, params },
      });
    }
    return first as HourlyObservationResponse;
  }

  private async fetchWithRetry(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<OpenMeteoAnyResponse[]> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const responses = await fetchWeatherApi(url, params);
        return this.ensureArray(responses);
      } catch (err: unknown) {
        lastError = err;
        const retryable = this.shouldRetry(err);

        if (!retryable || attempt === MAX_ATTEMPTS) {
          throw new ExternalServiceError(
            "OpenMeteo API呼び出しに失敗しました",
            {
              cause: err,
              details: {
                url,
                params,
                attempt,
                maxAttempts: MAX_ATTEMPTS,
                retryable,
                errorCode: this.getErrorCode(err),
                statusCode: this.getStatusCode(err),
              },
            }
          );
        }

        const delayMs = this.calculateDelayMs(attempt);
        await this.sleep(delayMs);
      }
    }

    throw new ExternalServiceError("OpenMeteo API呼び出しに失敗しました", {
      cause: lastError,
      details: {
        url,
        params,
        attempt: MAX_ATTEMPTS,
        maxAttempts: MAX_ATTEMPTS,
      },
    });
  }

  private shouldRetry(err: unknown): boolean {
    const code = this.getErrorCode(err);
    if (code && RETRYABLE_ERROR_CODES.has(code)) return true;

    const status = this.getStatusCode(err);
    if (status !== undefined && status >= 500) return true;

    return false;
  }

  private getErrorCode(err: unknown): string | undefined {
    if (!err || typeof err !== "object") return undefined;
    const e = err as { code?: unknown; cause?: { code?: unknown } };
    if (typeof e.code === "string") return e.code;
    if (typeof e.cause?.code === "string") return e.cause.code;
    return undefined;
  }

  private getStatusCode(err: unknown): number | undefined {
    if (!err || typeof err !== "object") return undefined;
    const e = err as {
      status?: unknown;
      response?: { status?: unknown };
      cause?: { status?: unknown; response?: { status?: unknown } };
    };

    if (typeof e.status === "number") return e.status;
    if (typeof e.response?.status === "number") return e.response.status;
    if (typeof e.cause?.status === "number") return e.cause.status;
    if (typeof e.cause?.response?.status === "number")
      return e.cause.response.status;

    return undefined;
  }

  private calculateDelayMs(attempt: number): number {
    const exponential = Math.min(
      MAX_DELAY_MS,
      BASE_DELAY_MS * 2 ** (attempt - 1)
    );
    const jitter = Math.floor(exponential * JITTER_RATE * Math.random());
    return exponential + jitter;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
