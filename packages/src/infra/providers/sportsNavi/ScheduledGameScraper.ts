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
  ): Promise<string> {
    const url = `https://baseball.yahoo.co.jp/npb/schedule/?date=${year}-${month}-${day}`;

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
      const results: ScheduledGameInfo[] = [];

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

            const startTime = this.emptyToNull(
              this.normalizeText(
                container.find("time.bb-score__status").text().trim()
              )
            );
            if (startTime === null) return;

            results.push({
              year,
              month,
              day,
              startTime,
              ballPark,
              category,
              homeTeam,
              awayTeam,
            });
          });
      });

      if (!results.length) {
        throw new InfrastructureError(
          "mapping",
          "試合情報が抽出できませんでした（HTML構造が変わった可能性）"
        );
      }

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

  private rangeDays(from: Date, to: Date) {
    const res: { year: number; month: number; day: number }[] = [];
    const cursor = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    );
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    while (cursor <= end) {
      res.push({
        year: cursor.getFullYear(),
        month: cursor.getMonth() + 1,
        day: cursor.getDate(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return res;
  }
}
