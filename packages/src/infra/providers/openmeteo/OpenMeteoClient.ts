import { fetchWeatherApi } from "openmeteo";
import {
  DailyForecastResponse,
  HourlyForecastResponse,
  HourlyObservationResponse,
} from "./types/OpenMeteoTypes";
import { Agent, type Dispatcher } from "undici";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";
import { ExternalServiceError } from "../../../shared/errors/ExternalServiceError";

export type OpenMeteoAnyResponse = {
  daily?: () => unknown;
  hourly?: () => unknown;
};

type UndiciRequestInit = RequestInit & {
  dispatcher?: Dispatcher;
};

const RETRYABLE_ERROR_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "EAI_AGAIN",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_SOCKET",
  "ABORT_ERR",
]);

const RETRYABLE_ERROR_NAMES = new Set([
  "AbortError",
  "TimeoutError",
  "HeadersTimeoutError",
  "BodyTimeoutError",
]);
const RETRYABLE_ERROR_MESSAGES = new Set([
  "Bad Gateway",
  "Gateway Timeout",
  "Internal Server Error",
  "Service Unavailable",
]);

const SOCKET_RESET_ERROR_CODES = new Set(["ECONNRESET", "UND_ERR_SOCKET"]);

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS = 30_000;
const JITTER_RATE = 0.5;

const KEEP_ALIVE_TIMEOUT_MS = 5_000;
const KEEP_ALIVE_MAX_TIMEOUT_MS = 10_000;

export class OpenMeteoClient {
  private dispatcher: Dispatcher = this.createDispatcher();

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

  private createDispatcher(): Dispatcher {
    return new Agent({
      keepAliveTimeout: KEEP_ALIVE_TIMEOUT_MS,
      keepAliveMaxTimeout: KEEP_ALIVE_MAX_TIMEOUT_MS,
      pipelining: 1,
    });
  }
  private buildFetchOptions(): UndiciRequestInit {
    return {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      dispatcher: this.dispatcher,
    };
  }
  private async resetDispatcher(): Promise<void> {
    const oldDispatcher = this.dispatcher;
    this.dispatcher = this.createDispatcher();
    try {
      await oldDispatcher.close();
    } catch {
      // クリーンアップ失敗は致命ではないので握りつぶす
    }
  }

  private async fetchWithRetry(
    url: string,
    params: Record<string, string | number | boolean | string[]>
  ): Promise<OpenMeteoAnyResponse[]> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const responses = await fetchWeatherApi(
          url,
          params,
          1,
          0.2,
          2,
          this.buildFetchOptions()
        );
        return this.ensureArray(responses);
      } catch (err: unknown) {
        lastError = err;
        const retryable = this.shouldRetry(err);

        if (retryable && this.shouldResetDispatcher(err)) {
          await this.resetDispatcher();
        }

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
                errorName: this.getErrorName(err),
                errorMessage: this.getErrorMessage(err),
                statusCode: this.getStatusCode(err),
                timeoutMs: REQUEST_TIMEOUT_MS,
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
    const name = this.getErrorName(err);
    if (name && RETRYABLE_ERROR_NAMES.has(name)) return true;
    const message = this.getErrorMessage(err);
    if (message && RETRYABLE_ERROR_MESSAGES.has(message)) return true;
    const status = this.getStatusCode(err);
    if (status !== undefined && status >= 500) return true;
    return false;
  }

  private shouldResetDispatcher(err: unknown): boolean {
    const code = this.getErrorCode(err);
    return code ? SOCKET_RESET_ERROR_CODES.has(code) : false;
  }

  private getErrorCode(err: unknown): string | undefined {
    if (!err || typeof err !== "object") return undefined;
    const e = err as { code?: unknown; cause?: { code?: unknown } };
    if (typeof e.code === "string") return e.code;
    if (typeof e.cause?.code === "string") return e.cause.code;
    return undefined;
  }

  private getErrorName(err: unknown): string | undefined {
    if (!err || typeof err !== "object") return undefined;
    const e = err as {
      name?: unknown;
      cause?: { name?: unknown };
    };
    if (typeof e.name === "string") return e.name;
    if (typeof e.cause?.name === "string") return e.cause.name;
    return undefined;
  }

  private getErrorMessage(err: unknown): string | undefined {
    if (!err || typeof err !== "object") return undefined;
    const e = err as {
      message?: unknown;
      cause?: { message?: unknown };
    };
    if (typeof e.message === "string") return e.message;
    if (typeof e.cause?.message === "string") return e.cause.message;
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
