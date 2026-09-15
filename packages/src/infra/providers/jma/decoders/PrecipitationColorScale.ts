/**
 * 気象庁の降水量カラースケール。
 *
 * 無料で取得できるタイルはPNG画像なので、降水量が8階級に量子化されている。
 * ここでは色から階級を引き、階級ごとの代表値をmmとして返す。
 *
 * ■ 代表値について
 * representativeMm は較正で差し替える前提の初期値で、いまは階級中央値を入れている。
 * 降水量は階級内で右に歪んだ分布をしており、中央値を当てると系統的に過大評価になる。
 * 特に「1〜5mm」は中止判断に効く雨のほとんどが入る階級で、ここを 3.0 にするか 2.0 にするかで
 * 予測が大きく動く。正しくは階級ごとの条件付き期待値 E[mm | 階級] を実測で求める。
 * 比較の正は学習に使った ERA5実況(Open-Meteo archive の rain)に統一する。
 *
 * ■ パレットの安定性
 * 降水域があるタイルは全国どこでも同じ10色パレット(白2 + 8階級)を持つことを確認済みだが、
 * インデックスではなく色で引いている。空タイルがRGBA形式で返るなど形式が揺れるため、
 * 色で引く方が形式差を吸収できる。
 */
export interface PrecipitationClass {
  /** パレット上のRGB */
  readonly rgb: readonly [number, number, number];
  /** 階級の下限(mm/時)。含む */
  readonly lowerMm: number;
  /** 階級の上限(mm/時)。含まない。最上位階級は上限なし */
  readonly upperMm: number | null;
  /** モデルに渡す代表値(mm)。較正で差し替える */
  readonly representativeMm: number;
}

/** 階級の定義。上限なしの階級は代表値を便宜的に置いている */
export const PRECIPITATION_CLASSES: readonly PrecipitationClass[] = [
  { rgb: [242, 242, 255], lowerMm: 0.1, upperMm: 1, representativeMm: 0.55 },
  { rgb: [160, 210, 255], lowerMm: 1, upperMm: 5, representativeMm: 3.0 },
  { rgb: [33, 140, 255], lowerMm: 5, upperMm: 10, representativeMm: 7.5 },
  { rgb: [0, 65, 255], lowerMm: 10, upperMm: 20, representativeMm: 15.0 },
  { rgb: [250, 245, 0], lowerMm: 20, upperMm: 30, representativeMm: 25.0 },
  { rgb: [255, 153, 0], lowerMm: 30, upperMm: 50, representativeMm: 40.0 },
  { rgb: [255, 40, 0], lowerMm: 50, upperMm: 80, representativeMm: 65.0 },
  { rgb: [180, 0, 104], lowerMm: 80, upperMm: null, representativeMm: 100.0 },
] as const;

/** アルファ値がこれ未満なら透過とみなす */
const TRANSPARENT_ALPHA_THRESHOLD = 128;

export class PrecipitationColorScale {
  private static readonly byColor: ReadonlyMap<number, PrecipitationClass> =
    new Map(
      PRECIPITATION_CLASSES.map((entry) => [
        PrecipitationColorScale.packRgb(
          entry.rgb[0],
          entry.rgb[1],
          entry.rgb[2],
        ),
        entry,
      ]),
    );

  /**
   * 画素の色から降水量(mm)を求める。
   *
   * 透過画素は降水なしとして 0 を返す。
   * 気象庁のタイルでは「レーダー範囲外」も透過で表現されるが、
   * 対象の球場はいずれも十分に覆域内にあるため 0 として扱ってよい。
   *
   * 既知のどの階級色にも一致しない場合は null を返す。
   * 呼び出し側で件数を数え、多すぎる場合は他ソースへ切り替える判断に使う。
   */
  static toMillimeters(
    red: number,
    green: number,
    blue: number,
    alpha: number,
  ): number | null {
    if (alpha < TRANSPARENT_ALPHA_THRESHOLD) return 0;
    const hit = this.byColor.get(this.packRgb(red, green, blue));
    if (hit) return hit.representativeMm;
    // 白は「降水なし」を不透明で塗ったもの。パレット先頭2色がこれにあたる
    if (red === 255 && green === 255 && blue === 255) return 0;
    return null;
  }

  /** 色に対応する階級を返す。階級そのものを見たい用途向け */
  static classify(
    red: number,
    green: number,
    blue: number,
    alpha: number,
  ): PrecipitationClass | null {
    if (alpha < TRANSPARENT_ALPHA_THRESHOLD) return null;
    return this.byColor.get(this.packRgb(red, green, blue)) ?? null;
  }

  private static packRgb(red: number, green: number, blue: number): number {
    return (red << 16) | (green << 8) | blue;
  }
}
