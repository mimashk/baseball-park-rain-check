import { PrecipitationResolutionDto } from "../dtos/PrecipitationResolutionDto";

/**
 * 降水量の差し替え記録を残す。
 *
 * 既存の時間別予報(`hourly-weather/`)とは**別のプレフィックスに保存する**。
 * あちらは `date` をキーに上書きマージするため、同じ場所に書くと
 * 毎時の予報バッチが実況を潰してしまうため。
 *
 * 追記専用。1回の差し替えを1件として残し、既存の記録は書き換えない。
 * 同じスロットでもリード時間によって値が変わるので、
 * 上書きすると較正に必要なリード時間の軸が失われる。
 */
export interface PrecipitationResolutionRepository {
  append(resolution: PrecipitationResolutionDto): Promise<void>;
}
