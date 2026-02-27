import * as cheerio from "cheerio";
import { ExternalServiceError } from "../../../shared/errors/ExternalServiceError";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";
import { TeamId } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";

export type GameStatusInfo = {
  homeTeam: string;
  awayTeam: string;
  status: string;
};

export class GameStatusScraper {
  async fetchStatus(params: {
    date: Date;
    homeTeamId: TeamId;
    awayTeamId: TeamId;
  }): Promise<GameStatusInfo[]> {
    const html = await this.fetchHtml(params.date);
    return this.parseGameStatus(html);
  }

  private async fetchHtml(date: Date): Promise<string> {
    const { year, month, day } = this.toJstYmd(date);
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

      $(".bb-score").each((_, section) => {
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

            const status = this.emptyToNull(
              this.normalizeText(
                container.find("p.bb-score__link").text().trim()
              )
            );
            if (status === null) return;

            results.push({ homeTeam, awayTeam, status });
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

  private readonly jstFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  private toJstYmd(date: Date): { year: number; month: number; day: number } {
    const parts = this.jstFormatter.formatToParts(date);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    if (!y || !m || !d) {
      throw new InfrastructureError("mapping", "JST日付の生成に失敗しました");
    }
    return { year: Number(y), month: Number(m), day: Number(d) };
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
