import * as cheerio from "cheerio";
import { ExternalServiceError } from "../../../shared/errors/ExternalServiceError";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";

export type GameStatusInfo = {
  homeTeam: string;
  awayTeam: string;
  status: string;
};

export class GameStatusScraper {
  async fetchStatus(params: {
    date: Date;
    homeTeamName: string;
    awayTeamName: string;
  }): Promise<GameStatusInfo[]> {
    const html = await this.fetchHtml(params.date);
    return this.parseGameStatus(html);
  }

  private async fetchHtml(date: Date): Promise<string> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
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

  private parseGameStatus(html: string): GameStatusInfo[] {
    try {
      const $ = cheerio.load(html);
      const results: GameStatusInfo[] = [];

      $(".bb-score__item").each((_, item) => {
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

        const status = this.emptyToNull(
          this.normalizeText(container.find("p.bb-score__link").text().trim())
        );
        if (status === null) return;

        results.push({ homeTeam, awayTeam, status });
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
}
