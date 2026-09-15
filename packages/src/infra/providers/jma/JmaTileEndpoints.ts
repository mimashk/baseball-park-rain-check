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
   * ■ パスの3要素目はプロダクトの区別
   * 「解析値か予測値か」ではなく、**どちらの予報プロダクトか**で決まる。
   *
   *   - リード 1〜6時間  … "immed" = 降水短時間予報。レーダー外挿を数値予報にブレンドしたもの
   *   - リード 7〜15時間 … "none"  = 降水15時間予報。数値予報ベース
   *   - リード 0         … "none"  = 解析雨量
   *
   * 実測では両者は**別物**で、同じ basetime / validtime でも値が異なる。
   * リードが伸びるほど差が開く(1時間先で4,791画素、6時間先で19,432画素が相違)。
   * リード1〜6で "none" を使うとレーダー由来の鮮度を捨てることになるので、必ず使い分ける。
   *
   * なお "none" はリード0〜15すべてで200を返すため、取り違えても404にならない。
   * 静かに精度の低い値を使い続けることになるので注意。
   *
   * ■ ズームは偶数のみ
   * z=4, 6, 8, 10 は配信されているが、奇数ズームは404になる。
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
    if (input.zoom % 2 !== 0) {
      throw new ValidationError("タイルは偶数ズームのみ配信されています", {
        zoom: input.zoom,
      });
    }

    const segment = this.segmentFor(input.basetime, input.validtime);
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

  /** リード1〜6時間だけが降水短時間予報(immed)、それ以外は15時間予報・解析雨量(none) */
  private static segmentFor(basetime: string, validtime: string): string {
    const leadHours =
      (this.toEpochMs(validtime) - this.toEpochMs(basetime)) / 3_600_000;
    return leadHours >= 1 && leadHours <= 6 ? "immed" : "none";
  }

  private static toEpochMs(timestamp: string): number {
    const iso =
      `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}` +
      `T${timestamp.slice(8, 10)}:${timestamp.slice(10, 12)}:${timestamp.slice(12, 14)}Z`;
    return Date.parse(iso);
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
