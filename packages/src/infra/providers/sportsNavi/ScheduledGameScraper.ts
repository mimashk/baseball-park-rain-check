import * as cheerio from "cheerio";
import { ExternalServiceError } from "../../../shared/errors/ExternalServiceError";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";

export type ScheduledGameInfo = {
  year: number;
  month: number;
  day: number;
  startTime: string;
  ballPark: string;
  category: string;
  homeTeam: string;
  awayTeam: string;
};

export class ScheduledGameScraper {
  async fetchScheduledGames(params: {
    year: number;
    month: number;
    day: number;
  }): Promise<ScheduledGameInfo[]> {
    // 2月から11月までしかでページがないので、それに合わせてチェックする
    if (params.month < 2 || params.month > 11) {
      return [];
    }
    const html = await this.fetchHtml(params.year, params.month, params.day);
    if (html === null) return []; // 404 スルー
    return this.parseScheduledGames(
      html,
      params.year,
      params.month,
      params.day
    );
  }

  private async fetchHtml(
    year: number,
    month: number,
    day: number
  ): Promise<string | null> {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const url = `https://baseball.yahoo.co.jp/npb/schedule/?date=${year}-${mm}-${dd}`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          // 公式サイトがUAで挙動を変えることがあるので入れておくと安定しやすい
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
          "accept-language": "ja,en;q=0.8",
        },
      });
    } catch (err) {
      throw new ExternalServiceError("試合情報ページの取得に失敗しました", {
        cause: err,
        details: { url },
      });
    }

    if (res.status === 404) {
      return null; // 試合がない日はスルー
    }

    if (!res.ok) {
      throw new ExternalServiceError(
        `スクレイピングが開始できませんでした: ${url} (${res.status})`,
        { details: { url, status: res.status } }
      );
    }

    try {
      return await res.text();
    } catch (err) {
      throw new ExternalServiceError("試合情報ページの読み取りに失敗しました", {
        cause: err,
        details: { url },
      });
    }
  }

  private parseScheduledGames(
    html: string,
    year: number,
    month: number,
    day: number
  ): ScheduledGameInfo[] {
    try {
      const $ = cheerio.load(html);

      // 試合なし判定（HTMLは正常だがデータがない日）
      if (this.hasNoGameMessage($)) {
        return [];
      }

      // ページのタイトルから月日を拾う（年は引数のまま）
      const extracted = this.extractMonthDayFromTitle($);
      const actualMonth = extracted?.month;
      const actualDay = extracted?.day;
      if (actualMonth === undefined || actualDay === undefined) {
        throw new InfrastructureError(
          "mapping",
          "試合の日付情報が抽出できませんでした（HTML構造が変わった可能性）"
        );
      }

      const results: ScheduledGameInfo[] = [];
      let hasGameItem = false; // 試合DOM自体が存在したか
      let skippedByStatus = 0; // スコア/試合終了などでスキップした件数

      $(".bb-score").each((_, section) => {
        const category = this.emptyToNull(
          this.normalizeText(
            $(section).find(".bb-score__title").first().text().trim()
          )
        );
        if (category === null) return;

        $(section)
          .find(".bb-score__item")
          .each((_, item) => {
            hasGameItem = true;
            const container = $(item);

            const homeTeam = this.emptyToNull(
              this.normalizeText(
                container.find("p.bb-score__homeLogo").text().trim()
              )
            );
            if (homeTeam === null) return;

            const awayTeam = this.emptyToNull(
              this.normalizeText(
                container.find("p.bb-score__awayLogo").text().trim()
              )
            );
            if (awayTeam === null) return;

            const ballPark = this.emptyToNull(
              this.normalizeText(
                container.find("span.bb-score__venue").text().trim()
              )
            );
            if (ballPark === null) return;

            // 開始前は時刻、開始後は「試合終了」やスコア表示になる
            const statusText = this.emptyToNull(
              this.normalizeText(
                container.find(".bb-score__status").first().text().trim()
              )
            );
            if (statusText === null || !this.isStartTime(statusText)) {
              skippedByStatus++;
              return;
            }

            results.push({
              year,
              month: actualMonth,
              day: actualDay,
              startTime: statusText,
              ballPark,
              category,
              homeTeam,
              awayTeam,
            });
          });
      });

      if (!results.length) {
        // 試合DOMはあるが時刻形式が1件もない=過去進行/終了試合だけだったとみなして正常スキップ
        if (hasGameItem && skippedByStatus > 0) {
          return [];
        }

        throw new InfrastructureError(
          "mapping",
          "試合情報が抽出できませんでした（HTML構造が変わった可能性）"
        );
      }
      console.log(results);

      return results;
    } catch (err) {
      if (err instanceof InfrastructureError) throw err;
      throw new InfrastructureError(
        "mapping",
        "試合情報のパースに失敗しました",
        {
          cause: err,
        }
      );
    }
  }

  private normalizeText(text: string): string {
    const normalized = text
      .normalize("NFKC") // 全角→半角（英数・記号・スペースなど）
      .replace(/\s+/g, " ")
      .trim();
    return normalized;
  }

  private emptyToNull(text: string): string | null {
    return text.length ? text : null;
  }

  private extractMonthDayFromTitle($: cheerio.CheerioAPI): {
    month: number;
    day: number;
  } | null {
    const text = $(".bb-head01__title").first().text().trim();
    // 例: "2月23日（月）"
    const m = text.match(/(\d{1,2})月\s*(\d{1,2})日/);
    if (!m) return null;
    return { month: Number(m[1]), day: Number(m[2]) };
  }

  private hasNoGameMessage($: cheerio.CheerioAPI): boolean {
    const text = $("p.bb-noData").first().text().trim();
    return text.includes("試合はありません");
  }

  private isStartTime(value: string): boolean {
    // 例: "12:30"
    return /^\d{1,2}:\d{2}$/.test(value);
  }
}
