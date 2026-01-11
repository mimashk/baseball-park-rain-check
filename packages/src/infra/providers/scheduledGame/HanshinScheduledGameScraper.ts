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

export class HanshinScheduledGameScraper {
  async fetchMonthlyGames(params: {
    year: number;
    month: number;
  }): Promise<ScheduledGameInfo[]> {
    const html = await this.fetchHtml(params.year, params.month);
    return this.parseMonthlyGames(html, params.year, params.month);
  }

  private async fetchHtml(year: number, month: number): Promise<string> {
    const mm = String(month).padStart(2, "0");
    const url = `https://hanshintigers.jp/game/schedule/${year}/${mm}l.html`;

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

  private parseMonthlyGames(
    html: string,
    year: number,
    month: number
  ): ScheduledGameInfo[] {
    try {
      const $ = cheerio.load(html);

      // 1) 「試合一覧コンテナ」だけにスコープを絞る
      const container = $("#article");
      if (!container.length) {
        throw new InfrastructureError(
          "mapping",
          "「試合一覧コンテナ」が見つかりません（HTML構造が変わった可能性）",
          { details: { year, month } }
        );
      }
      const table = container.is("table")
        ? container
        : container.find("table").first();
      const rows = table.find("tbody tr");

      const results: ScheduledGameInfo[] = [];

      // 2) container 内の tr を走査
      rows.each((_, tr) => {
        const row = $(tr);

        // 日付は th で取得する
        const thText = this.normalizeText(row.find("th").first().text()); // "1日 （金）" のように取れる
        const day = this.extractDay(thText);
        if (day === null) return; // 日付取れない行はスキップ

        // ---- 残りは .match_info から ----
        const matchInfo = row.find("td.match_info, td.match-info").first();
        if (!matchInfo.length) return;

        const startTime = this.emptyToNull(
          this.normalizeText(matchInfo.find("li.time").first().text())
        );
        if (startTime === null) return;

        const ballPark = this.emptyToNull(
          this.normalizeText(matchInfo.find("li.place").first().text())
        );
        if (ballPark === null) return;

        const detail = matchInfo.find("li.detail").first();
        const detailText = this.normalizeText(
          detail.clone().children().remove().end().text()
        );
        // ↑ strong など子要素を除いた「テキストだけ」(例: オープン戦)
        const gameCategory = this.emptyToNull(this.stripQuotes(detailText));
        if (gameCategory === null) return;

        // チーム: strong の中に "中 - 神" が入ってる
        const teamsText = this.normalizeText(
          detail.find("strong").first().text()
        );
        const { awayTeam, homeTeam } = this.parseTeamsFromStrong(teamsText);
        if (awayTeam === null || homeTeam === null) return;

        results.push({
          year,
          month,
          day,
          startTime,
          category: gameCategory,
          homeTeam,
          awayTeam,
          ballPark,
        });
      });

      if (!results.length) {
        throw new InfrastructureError(
          "mapping",
          "試合情報が抽出できませんでした（HTML構造が変わった可能性）",
          { details: { year, month } }
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
          details: { htmlBody: this.extractBodyForDebug(html) },
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

  private extractDay(text: string): number | null {
    // "1日 （金）" / "21日(金)" / "21(土)" などから数字を抜く
    const m = text.match(/\b(\d{1,2})\b/);
    if (!m) return null;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : null;
  }

  private stripQuotes(text: string): string {
    // '"オープン戦"' のように引用符が混ざっていても剥がす
    return text.replace(/^["“”']+|["“”']+$/g, "");
  }

  private parseTeamsFromStrong(text: string): {
    awayTeam: string | null;
    homeTeam: string | null;
  } {
    // strong の例: "中 - 神" / "中-神" / "中 − 神" など揺れを吸収
    const normalized = text.replace(/[－−—]/g, "-"); // 全角ダッシュ等を "-" に寄せる
    const m = normalized.match(/^\s*(.+?)\s*-\s*(.+?)\s*$/);
    if (!m) return { awayTeam: null, homeTeam: null };

    // ここでは「左がビジター、右がホーム」という前提
    return {
      awayTeam: this.normalizeText(m[1]),
      homeTeam: this.normalizeText(m[2]),
    };
  }

  private extractBodyForDebug(html: string, limit = 4000): string {
    try {
      const $ = cheerio.load(html);
      const body = $("body").html() ?? "";
      return body.slice(0, limit);
    } catch {
      // cheerio で失敗しても全文ではなく上限付きで返す
      return html.slice(0, limit);
    }
  }
}
