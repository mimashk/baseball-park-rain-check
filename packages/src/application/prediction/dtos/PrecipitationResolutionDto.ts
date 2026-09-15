import { PrecipitationSourceType } from "../interfaces/PrecipitationSampleProvider";

/** 1スロットぶんの差し替え記録 */
export interface PrecipitationResolutionSlotDto {
  /** スロット時刻(ISO8601)。値はこの時刻で終わる前1時間の積算 */
  readonly date: string;
  /** 採用した降水量(mm) */
  readonly resolvedMillimeters: number;
  /** 差し替え前に Open-Meteo が返していた値(mm) */
  readonly baselineMillimeters: number;
  readonly source: PrecipitationSourceType;
  /** 空間平均を取るソースでの中心1地点の値(mm) */
  readonly pointMillimeters: number | null;
  /** 観測時刻または予報の初期時刻(ISO8601) */
  readonly sourceTime: string | null;
  /** 予報の場合のリード時間。較正で「どこから Open-Meteo に切り替えるか」を決める材料になる */
  readonly leadHours: number | null;
}

/**
 * 1回の差し替え処理の記録。
 *
 * 較正(フェーズ4)とシャドー比較(フェーズ3)の材料になる。
 * 降水短時間予報にはアーカイブが無いため、ここで残さないと後から復元できない。
 * リード時間ごとの精度を見たいので、実行のたびに1件ずつ追記する。
 */
export interface PrecipitationResolutionDto {
  readonly ballParkId: number;
  /** この記録を作った時刻(ISO8601) */
  readonly resolvedAt: string;
  readonly slots: readonly PrecipitationResolutionSlotDto[];
}
