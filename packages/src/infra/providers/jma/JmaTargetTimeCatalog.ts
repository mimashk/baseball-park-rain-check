import { InfrastructureError } from "../../../shared/errors/InfrastructureError";
import { ValidationError } from "../../../shared/errors/ValidationError";

/** targetTimes.json の1件 */
export interface JmaTargetTimeEntry {
  readonly basetime: string;
  readonly validtime: string;
  readonly elements: readonly string[];
}

/** 取得に使う basetime と validtime の組 */
export interface TargetTimeSelection {
  readonly basetime: string;
  readonly validtime: string;
  /** 初期時刻から対象時刻までの時間。解析値なら 0 */
  readonly leadHours: number;
}

/**
 * targetTimes.json を読み、目的の時刻に対応するタイルの取得先を決める。
 *
 * ■ 注意: validtime は basetime の「分」に追随する
 * basetime 09:00 の予報は validtime も 10:00, 11:00 … と正時に並ぶが、
 * basetime 09:30 の予報は validtime が 10:30, 11:30 … と :30 に並ぶ。
 * 予測に使うスロットは正時(= 前1時間の積算)なので、
 * 正時スロットを埋められるのは :00 の basetime だけになる。
 *
 * そのためここでは validtime の完全一致のみを採用し、
 * ずれた時刻のランで代用することはしない。1時間ぶんの積算が
 * 20分ずれた別の区間の値に置き換わると、特徴量の意味が変わってしまうため。
 * 一致するランが無い場合は null を返し、呼び出し側で Open-Meteo に退避する。
 *
 * ■ targetTimes.json は予報ランを最新しか保持しない
 * 解析値(リード0)は10分刻みで十数時間ぶん並ぶが、予報を持つ basetime は
 * 数件しか載らない。過去に遡って取得することはできない。
 */
export class JmaTargetTimeCatalog {
  private constructor(private readonly entries: readonly JmaTargetTimeEntry[]) {}

  static fromJson(payload: unknown): JmaTargetTimeCatalog {
    if (!Array.isArray(payload)) {
      throw new InfrastructureError(
        "mapping",
        "targetTimes.json が配列ではありません",
      );
    }

    const entries: JmaTargetTimeEntry[] = [];
    for (const raw of payload) {
      if (!raw || typeof raw !== "object") continue;
      const candidate = raw as Record<string, unknown>;
      const basetime = candidate.basetime;
      const validtime = candidate.validtime;
      if (typeof basetime !== "string" || typeof validtime !== "string") {
        continue;
      }
      if (!/^\d{14}$/.test(basetime) || !/^\d{14}$/.test(validtime)) continue;

      const elements = Array.isArray(candidate.elements)
        ? candidate.elements.filter(
            (element): element is string => typeof element === "string",
          )
        : [];
      entries.push({ basetime, validtime, elements });
    }

    if (entries.length === 0) {
      throw new InfrastructureError(
        "mapping",
        "targetTimes.json に有効な項目がありません",
      );
    }
    return new JmaTargetTimeCatalog(entries);
  }

  /**
   * 指定時刻のタイルを取得するための basetime / validtime を選ぶ。
   * 候補が複数ある場合は最も新しい basetime を採用する。
   *
   * 注意: `targetTimes.json` は予報ランを最新しか保持しないため、
   * 正時のランが実在してタイルも配信されているのに一覧から消えていることがある
   * (例: 09:30 のランが載ると 09:00 のランは消える)。
   * したがって予報側の取得にこのメソッドだけを使うと取りこぼす。
   * 正時の basetime を直接組み立てて取りにいく `JmaShortRangeForecastProvider` を参照。
   */
  selectForTime(
    target: Date,
    options: { element?: string } = {},
  ): TargetTimeSelection | null {
    const validtime = JmaTargetTimeCatalog.toTimestamp(target);

    const candidates = this.entries.filter((entry) => {
      if (entry.validtime !== validtime) return false;
      if (options.element && !entry.elements.includes(options.element)) {
        return false;
      }
      return true;
    });
    if (candidates.length === 0) return null;

    const latest = candidates.reduce((best, entry) =>
      entry.basetime > best.basetime ? entry : best,
    );

    return {
      basetime: latest.basetime,
      validtime: latest.validtime,
      leadHours:
        (JmaTargetTimeCatalog.toDate(latest.validtime).getTime() -
          JmaTargetTimeCatalog.toDate(latest.basetime).getTime()) /
        3_600_000,
    };
  }

  /**
   * 掲載されている basetime のうち最新のもの。
   *
   * 解析値は10分毎に追加されるため、これは実質「配信側の現在時刻」を表す。
   * ローカル時計のずれに影響されず、公開ラグも織り込まれた値になるので、
   * どの正時ランまで公開済みかを判断する基準に使う。
   */
  latestBasetime(): string {
    return this.entries.reduce(
      (best, entry) => (entry.basetime > best ? entry.basetime : best),
      this.entries[0].basetime,
    );
  }

  /** 予報を持つ basetime のうち最新のもの。更新状況の記録用 */
  latestForecastBasetime(): string | null {
    const forecastBasetimes = this.entries
      .filter((entry) => entry.validtime > entry.basetime)
      .map((entry) => entry.basetime);
    if (forecastBasetimes.length === 0) return null;
    return forecastBasetimes.reduce((best, value) =>
      value > best ? value : best,
    );
  }

  /** yyyyMMddHHmmss (UTC) に変換する */
  static toTimestamp(date: Date): string {
    if (Number.isNaN(date.getTime())) {
      throw new ValidationError("日時が不正です", { date });
    }
    const pad = (value: number, length = 2) =>
      String(value).padStart(length, "0");
    return [
      pad(date.getUTCFullYear(), 4),
      pad(date.getUTCMonth() + 1),
      pad(date.getUTCDate()),
      pad(date.getUTCHours()),
      pad(date.getUTCMinutes()),
      pad(date.getUTCSeconds()),
    ].join("");
  }

  /** yyyyMMddHHmmss (UTC) を Date に戻す */
  static toDate(timestamp: string): Date {
    if (!/^\d{14}$/.test(timestamp)) {
      throw new ValidationError(
        "時刻は yyyyMMddHHmmss 形式で指定してください",
        { timestamp },
      );
    }
    const iso =
      `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}` +
      `T${timestamp.slice(8, 10)}:${timestamp.slice(10, 12)}:${timestamp.slice(12, 14)}Z`;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      throw new ValidationError("時刻を解釈できません", { timestamp });
    }
    return date;
  }
}
