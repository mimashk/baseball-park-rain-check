import * as cheerio from "cheerio";

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

    const res = await fetch(url, {
      headers: {
        // 公式サイトがUAで挙動を変えることがあるので入れておくと安定しやすい
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
        "accept-language": "ja,en;q=0.8",
      },
    });

    if (!res.ok) {
      throw new Error(
        `スクレイピングが開始できませんでした: ${url} (${res.status})`
      );
    }

    return await res.text();
  }

  private parseGameStatus(html: string): GameStatusInfo[] {
    const $ = cheerio.load(html);
    const results: GameStatusInfo[] = [];

    $(".bb-score__item").each((_, item) => {
      const container = $(item);

      const homeTeam = this.emptyToNull(
        this.normalizeText(container.find("p.bb-score__homeLogo").text().trim())
      );
      if (homeTeam === null) return;

      const awayTeam = this.emptyToNull(
        this.normalizeText(container.find("p.bb-score__awayLogo").text().trim())
      );
      if (awayTeam === null) return;

      const status = this.emptyToNull(
        this.normalizeText(container.find("p.bb-score__link").text().trim())
      );
      if (status === null) return;

      results.push({ homeTeam, awayTeam, status });
    });

    return results;
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
