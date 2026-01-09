import * as cheerio from "cheerio";

export type PastGameInfo = {
  year: number;
  month: number;
  day: number;
  startTime: string;
  ballPark: string;
  ourTeam: string;
  opposingTeam: string;
  isAway: boolean;
  isCancelled: boolean;
};

export class HanshinPastGameScraper {
  async fetchYearlyGames(params: { year: number }): Promise<PastGameInfo[]> {
    const html = await this.fetchHtml(params.year);
    return this.parseYearlyGames(html, params.year);
  }
  private async fetchHtml(year: number): Promise<string> {
    const url = `https://nf3.sakura.ne.jp/php/stat_disp/stat_disp.php?y=${year}&leg=0&mon=0&tm=T&vst=all`;

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

  private parseYearlyGames(html: string, year: number): PastGameInfo[] {
    const $ = cheerio.load(html);

    // 1) 「試合一覧コンテナ」だけにスコープを絞る
    const container = $("#dmain_f");
    if (!container.length) {
      throw new Error(
        "「試合一覧コンテナ」が見つかりません（HTML構造が変わった可能性）"
      );
    }
    const results: PastGameInfo[] = [];

    // 2) container 内の tr を走査
    container.find('tbody tr[onmouseover="M_over(this)"]').each((_, tr) => {
      const row = $(tr);

      const tds = row.find("td");

      // index: 0=日付, 2=対戦相手, 3=球場, 4=ホーム/ビジター区分, 5=開始時刻, 18=試合結果
      // 日付
      const { month, day } = this.extractDate(tds.eq(0).text().trim());
      if (month === null || day === null) return;
      // 対戦相手
      const opposingTeam = this.emptyToNull(
        this.normalizeText(tds.eq(2).text().trim())
      );
      if (opposingTeam === null) return;

      // 球場
      const ballPark = this.emptyToNull(
        this.normalizeText(tds.eq(3).text().trim())
      );
      if (ballPark === null) return;

      // 開始時刻
      const startTime = this.validateTime(tds.eq(5).text().trim());
      if (startTime === null) return;
      // ビジターかホームかを判定
      const homeAndAwayText = this.emptyToNull(
        this.normalizeText(
          tds.eq(4).find("div.T").text().trim() || tds.eq(4).text().trim()
        )
      );
      if (homeAndAwayText === null) return;
      const isAway = homeAndAwayText.includes("V") ? true : false;

      // 試合結果
      const resultText = this.emptyToNull(
        this.normalizeText(tds.eq(18).text().trim())
      );
      if (resultText === null) return;
      const isCancelled = resultText.includes("中止") ? true : false;

      results.push({
        year,
        month,
        day,
        startTime,
        ballPark,
        ourTeam: "阪神",
        opposingTeam,
        isAway,
        isCancelled,
      });
    });

    // 日付順
    return results.sort((a, b) => a.day - b.day);
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

  private extractDate(text: string): {
    month: number | null;
    day: number | null;
  } {
    // "1日 （金）" / "21日(金)" / "21(土)" などから数字を抜く
    const m = text.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (m) {
      const month = Number(m[1]);
      const day = Number(m[2]);
      return { month, day };
    }
    return { month: null, day: null };
  }

  private validateTime(text: string): string | null {
    const m = text.match(/\b(\d{1,2}:\d{1,2})\b/);
    if (!m) return null;
    return m[1];
  }
}
