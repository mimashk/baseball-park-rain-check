import { ExternalServiceError } from "../../../shared/errors/ExternalServiceError";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 8_000;
const JITTER_RATE = 0.5;

/** タイルが存在しない場合の戻り値。降水域が無い時間帯などで起きうる */
export const TILE_NOT_FOUND = Symbol("TILE_NOT_FOUND");
export type TileFetchResult = Uint8Array | typeof TILE_NOT_FOUND;

/**
 * 気象庁のタイル配信から取得する。
 *
 * 公開データだが認証や利用登録の仕組みが無いぶん、こちらで行儀よく振る舞う必要がある。
 * 失敗時は指数バックオフで再試行し、404は再試行せずそのまま返す。
 *
 * 出典表示が利用条件なので、取得したデータを表示する画面には
 * 「出典：気象庁ホームページ」を明記すること。
 */
export class JmaTileClient {
  async fetchJson<T>(url: string): Promise<T> {
    const response = await this.fetchWithRetry(url);
    if (response === TILE_NOT_FOUND) {
      throw new ExternalServiceError("気象庁の時刻一覧が見つかりません", {
        details: { url },
      });
    }
    const text = new TextDecoder().decode(response);
    try {
      return JSON.parse(text) as T;
    } catch (err) {
      throw new ExternalServiceError("気象庁のJSONを解釈できません", {
        cause: err,
        details: { url, head: text.slice(0, 200) },
      });
    }
  }

  /** タイルを取得する。存在しない場合は TILE_NOT_FOUND を返す */
  async fetchTile(url: string): Promise<TileFetchResult> {
    return this.fetchWithRetry(url);
  }

  private async fetchWithRetry(url: string): Promise<TileFetchResult> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        // 404 は「その時刻のタイルが無い」という正常な応答なので再試行しない
        if (response.status === 404) return TILE_NOT_FOUND;

        if (!response.ok) {
          if (response.status < 500 || attempt === MAX_ATTEMPTS) {
            throw new ExternalServiceError("気象庁のタイル取得に失敗しました", {
              details: { url, status: response.status, attempt },
            });
          }
          lastError = new Error(`status ${response.status}`);
          await this.sleep(this.delayMs(attempt));
          continue;
        }

        return new Uint8Array(await response.arrayBuffer());
      } catch (err) {
        lastError = err;
        if (err instanceof ExternalServiceError) throw err;
        if (attempt === MAX_ATTEMPTS) break;
        await this.sleep(this.delayMs(attempt));
      }
    }

    throw new ExternalServiceError("気象庁のタイル取得に失敗しました", {
      cause: lastError,
      details: { url, maxAttempts: MAX_ATTEMPTS },
    });
  }

  private delayMs(attempt: number): number {
    const exponential = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (attempt - 1));
    return exponential + Math.floor(exponential * JITTER_RATE * Math.random());
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
