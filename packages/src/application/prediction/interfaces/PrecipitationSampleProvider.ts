import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

/** どのソース由来の値かを表す */
export const PrecipitationSource = {
  /** 気象庁アメダスの実況(前1時間降水量) */
  AMEDAS_OBSERVATION: "AMEDAS_OBSERVATION",
  /** 気象庁 降水短時間予報タイル */
  JMA_SHORT_RANGE_FORECAST: "JMA_SHORT_RANGE_FORECAST",
  /** Open-Meteo の数値予報。他が使えないときの土台 */
  OPEN_METEO_FORECAST: "OPEN_METEO_FORECAST",
} as const;
export type PrecipitationSourceType =
  (typeof PrecipitationSource)[keyof typeof PrecipitationSource];

/** 1スロットぶんの降水量 */
export interface PrecipitationSample {
  /** スロットの時刻。値はこの時刻で終わる前1時間の積算 */
  readonly date: Date;
  /** 特徴量に渡す降水量(mm) */
  readonly millimeters: number;
  /**
   * 中心1地点の降水量(mm)。空間平均を取るソースのみ返す。
   *
   * 空間平均は窓内に微小な値を残すため `rainOccurRate`(> 0 で判定)を
   * 1に向かって押し上げる。降雨の有無判定にはこちらを使う選択肢を残しておく。
   */
  readonly pointMillimeters: number | null;
  /** 観測時刻(実況)または予報の初期時刻。鮮度の記録用 */
  readonly sourceTime: Date | null;
}

/** 実況の降水量を供給する。過去スロットを埋めるために使う */
export interface ObservedPrecipitationProvider {
  /**
   * 指定した時刻の前1時間降水量を返す。
   * 値が取れなかった時刻は結果に含めない(欠測・未到達など)。
   */
  fetchObservedPrecipitation(
    ballParkId: BallParkId,
    slotTimes: readonly Date[],
  ): Promise<PrecipitationSample[]>;
}

/** 短時間予報の降水量を供給する。未来スロットを埋めるために使う */
export interface ShortRangePrecipitationForecastProvider {
  /**
   * 指定した時刻の前1時間降水量の予報を返す。
   * 対応するランが無い時刻は結果に含めない。
   */
  fetchForecastPrecipitation(
    ballParkId: BallParkId,
    slotTimes: readonly Date[],
  ): Promise<PrecipitationSample[]>;
}
