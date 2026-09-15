import { PrecipitationResolutionDto } from "../dtos/PrecipitationResolutionDto";
import { PrecipitationSource } from "../interfaces/PrecipitationSampleProvider";
import { ResolvedPrecipitationSeries } from "../services/PrecipitationSeriesResolver";

const HOUR_MS = 3_600_000;

/**
 * 差し替え結果を保存用のDTOに直す。
 *
 * リード時間をここで計算して持たせる。較正のときに
 * 「リードが何時間までなら気象庁のタイルが Open-Meteo より近いか」を
 * 見るための軸になるが、後から復元できないため保存時に埋めておく。
 */
export function mapResolvedSeriesToResolutionDto(
  series: ResolvedPrecipitationSeries,
  resolvedAt: Date,
): PrecipitationResolutionDto {
  const slots = series.slots.map((slot) => {
    const isForecast =
      slot.source === PrecipitationSource.JMA_SHORT_RANGE_FORECAST;
    const leadHours =
      isForecast && slot.sourceTime
        ? (slot.forecast.date.getTime() - slot.sourceTime.getTime()) / HOUR_MS
        : null;

    return {
      date: slot.forecast.date.toISOString(),
      resolvedMillimeters: slot.forecast.rainFall.toNumber(),
      baselineMillimeters: slot.baselineMillimeters,
      source: slot.source,
      pointMillimeters: slot.pointMillimeters,
      sourceTime: slot.sourceTime ? slot.sourceTime.toISOString() : null,
      leadHours,
    };
  });

  const ballParkId = series.slots[0]?.forecast.ballParkId;
  if (ballParkId === undefined) {
    throw new Error("差し替え結果が空です");
  }

  return {
    ballParkId,
    resolvedAt: resolvedAt.toISOString(),
    slots,
  };
}
