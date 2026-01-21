import * as cheerio from "cheerio";
import { ExternalServiceError } from "../../../shared/errors/ExternalServiceError";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";

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

export const TEAM_CODE_LIST = [
  { league: "0", key: "T", label: "阪神" },
  { league: "0", key: "G", label: "読売" },
  { league: "0", key: "C", label: "広島" },
  { league: "0", key: "DB", label: "横浜" },
  { league: "0", key: "S", label: "ヤクルト" },
  { league: "0", key: "D", label: "中日" },
  { league: "1", key: "F", label: "ファイターズ" },
  {
    league: "1",
    key: "B",
    label: "オリックス",
    legacyCode: "Bs",
    legacyToYear: 2018,
  },
  { league: "1", key: "M", label: "ロッテ" },
  { league: "1", key: "H", label: "ソフトバンク" },
  { league: "1", key: "E", label: "楽天" },
  { league: "1", key: "L", label: "西武" },
];

export type TeamCode = (typeof TEAM_CODE_LIST)[number];

export class PastGameScraper {
  async fetchYearlyGames(params: {
    year: number;
    teamCode: string;
    teamLabel: string;
    league: string;
  }): Promise<PastGameInfo[]> {
    const html = await this.fetchHtml(
      params.year,
      params.league,
      params.teamCode
    );
    await this.sleep(5000);
    return this.parseYearlyGames(html, params.year);
  }
  private async fetchHtml(
    year: number,
    league: string,
    teamCode: string
  ): Promise<string> {
    const url = `https://nf3.sakura.ne.jp/php/stat_disp/stat_disp.php?y=${year}&leg=${league}&mon=0&tm=${teamCode}&vst=all`;

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

  private parseYearlyGames(html: string, year: number): PastGameInfo[] {
    try {
      const $ = cheerio.load(html);

      // 1) 「試合一覧コンテナ」だけにスコープを絞る
      const container = $("#dmain_f table.Base tbody");
      if (!container.length) {
        throw new InfrastructureError(
          "mapping",
          "「試合一覧コンテナ」が見つかりません（HTML構造が変わった可能性）"
        );
      }
      const results: PastGameInfo[] = [];
      const rows = container.find("tr");
      if (!rows.length) return [];

      // 2) container 内の tr を走査
      rows.each((_, tr) => {
        const row = $(tr);
        const tds = row.find("td");
        if (tds.length < 6) return; // ヘッダー/空行を弾く
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

      if (!results.length) {
        throw new InfrastructureError(
          "mapping",
          "試合情報が抽出できませんでした（HTML構造が変わった可能性）",
          { details: { year } }
        );
      }

      // 日付順
      return results.sort((a, b) => a.day - b.day);
    } catch (err) {
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

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
