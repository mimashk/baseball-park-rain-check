import { ValidationError } from "../../../shared/errors/ValidationError";

const BASE_URL = "https://www.jma.go.jp/bosai/jmatile/data";

/**
 * 利用するプロダクト。
 * rasrf = 解析雨量・降水短時間予報。1時間降水量(mm)を8階級で配信する。
 */
export const JmaTileProduct = {
  PRECIPITATION_SHORT_RANGE_FORECAST: "rasrf",
} as const;
export type JmaTileProductType =
  (typeof JmaTileProduct)[keyof typeof JmaTileProduct];

/** レイヤ名。rasrf は1時間降水量、rasrf03h/24h は積算 */
export const JmaTileElement = {
  HOURLY_PRECIPITATION: "rasrf",
} as const;
export type JmaTileElementType =
  (typeof JmaTileElement)[keyof typeof JmaTileElement];

export interface TileUrlInput {
  readonly product: JmaTileProductType;
  /** 予報の初期時刻。yyyyMMddHHmmss (UTC) */
  readonly basetime: string;
  /** 対象時刻。yyyyMMddHHmmss (UTC) */
  readonly validtime: string;
  readonly element: JmaTileElementType;
  readonly zoom: number;
  readonly x: number;
  readonly y: number;
}

export class JmaTileEndpoints {
  /** 利用可能な basetime / validtime の一覧 */
  static targetTimes(product: JmaTileProductType): string {
    return `${BASE_URL}/${product}/targetTimes.json`;
  }

  /**
   * タイル画像のURLを組み立てる。
   *
   * パスの3要素目は解析値と予測値で異なる。
   *   - validtime === basetime … 解析値なので "none"
   *   - validtime  >  basetime … 予測値なので "immed"
   *
   * ここを取り違えると404になる。
   * (実測では解析値も "immed" で取得できたが、気象庁の配信サイトが使う
   *  "none" に合わせている)
   */
  static tile(input: TileUrlInput): string {
    this.assertTimestamp(input.basetime, "basetime");
    this.assertTimestamp(input.validtime, "validtime");
    if (!Number.isInteger(input.zoom) || input.zoom < 0) {
      throw new ValidationError("ズームレベルが不正です", { zoom: input.zoom });
    }
    if (!Number.isInteger(input.x) || !Number.isInteger(input.y)) {
      throw new ValidationError("タイル番号が不正です", {
        x: input.x,
        y: input.y,
      });
    }

    const segment = input.validtime === input.basetime ? "none" : "immed";
    return [
      BASE_URL,
      input.product,
      input.basetime,
      segment,
      input.validtime,
      "surf",
      input.element,
      input.zoom,
      input.x,
      `${input.y}.png`,
    ].join("/");
  }

  private static assertTimestamp(value: string, field: string): void {
    if (!/^\d{14}$/.test(value)) {
      throw new ValidationError(
        `${field} は yyyyMMddHHmmss 形式で指定してください`,
        { value },
      );
    }
  }
}
