import { BallParkHourlyWeatherForecast } from "../../../domain/weatherForecast/valueObjects/BallParkHourlyWeatherForecast";
import { ValidationError } from "../../../shared/errors/ValidationError";
import {
  ObservedPrecipitationProvider,
  PrecipitationSample,
  PrecipitationSource,
  PrecipitationSourceType,
  ShortRangePrecipitationForecastProvider,
} from "../interfaces/PrecipitationSampleProvider";

/** 解決後の1スロット。差し替え前の値も残してシャドー比較に使う */
export interface ResolvedPrecipitationSlot {
  readonly forecast: BallParkHourlyWeatherForecast;
  readonly source: PrecipitationSourceType;
  /** Open-Meteo が返していた値(mm)。差し替えの効果を測るために保持する */
  readonly baselineMillimeters: number;
  /** 空間平均を取るソースでの中心1地点の値(mm) */
  readonly pointMillimeters: number | null;
  /** 観測時刻または予報の初期時刻 */
  readonly sourceTime: Date | null;
}

export interface ResolvedPrecipitationSeries {
  /** アグリゲータへ渡す系列。型は差し替え前と同じなので下流は無変更で通る */
  readonly forecasts: readonly BallParkHourlyWeatherForecast[];
  /** 由来つきの内訳。永続化・ログ・シャドー比較用 */
  readonly slots: readonly ResolvedPrecipitationSlot[];
}

export interface ResolvePrecipitationSeriesInput {
  /** Open-Meteo 由来の系列。気温・天気コード・降水確率の供給元でもある */
  readonly baseSeries: readonly BallParkHourlyWeatherForecast[];
  readonly now: Date;
  /**
   * 実況が公開されるまでの余裕。
   * アメダスは観測時刻から10分ほど遅れて公開されるため、
   * 直前のスロットを取りに行っても空振りする。
   */
  readonly observationPublishLagMinutes?: number;
}

const DEFAULT_OBSERVATION_PUBLISH_LAG_MINUTES = 12;

/**
 * スロットごとに最も確からしい降水量へ差し替える。
 *
 * ■ 平均は取らない
 * もう起きた時間について、実況は事実で予報は推測である。
 * 混ぜると事実を推測で薄めるだけなので、置き換える。
 * 未来スロットには混ぜる相手がいない(実況が存在しない)。
 * つまり全体として「時刻に基づく選択」であって、数値のブレンドではない。
 *
 * ■ 優先順位
 *   1. アメダス実況      … スロットが過去で、観測が公開済みのもの
 *   2. 降水短時間予報    … 未来スロットのうち、正時のランが噛み合うもの
 *   3. Open-Meteo       … 上記が使えないスロット
 *
 * ■ 失敗しても悪化させない
 * 取得失敗・欠測はスロット単位で Open-Meteo に退避する。
 * 最悪でも差し替え前とまったく同じ結果になるだけで、予測が止まることはない。
 * 数日先の試合では実況も短時間予報も該当しないため、自動的に現状と同一になる。
 * このため当日用と通常用でコードを分ける必要がない。
 */
export class PrecipitationSeriesResolver {
  constructor(
    private readonly observedProvider: ObservedPrecipitationProvider,
    private readonly forecastProvider: ShortRangePrecipitationForecastProvider,
  ) {}

  async resolve(
    input: ResolvePrecipitationSeriesInput,
  ): Promise<ResolvedPrecipitationSeries> {
    const { baseSeries, now } = input;
    if (baseSeries.length === 0) {
      throw new ValidationError("差し替えの土台となる気象データがありません");
    }
    const ballParkId = baseSeries[0].ballParkId;

    const lagMinutes =
      input.observationPublishLagMinutes ??
      DEFAULT_OBSERVATION_PUBLISH_LAG_MINUTES;
    const observableUntil = new Date(now.getTime() - lagMinutes * 60_000);

    // スロットを「実況で埋められるもの」と「予報で埋めるもの」に分ける。
    // スロットの値はその時刻で終わる前1時間の積算なので、
    // スロット時刻を過ぎていれば実況が確定している。
    const observedSlots: Date[] = [];
    const forecastSlots: Date[] = [];
    for (const entry of baseSeries) {
      if (entry.date.getTime() <= observableUntil.getTime()) {
        observedSlots.push(entry.date);
      } else {
        forecastSlots.push(entry.date);
      }
    }

    const [observed, forecast] = await Promise.all([
      this.safeFetch(() =>
        this.observedProvider.fetchObservedPrecipitation(
          ballParkId,
          observedSlots,
        ),
      ),
      this.safeFetch(() =>
        this.forecastProvider.fetchForecastPrecipitation(
          ballParkId,
          forecastSlots,
        ),
      ),
    ]);

    const observedByTime = this.indexByTime(observed);
    const forecastByTime = this.indexByTime(forecast);

    const slots = baseSeries.map((entry) => {
      const key = entry.date.getTime();
      const hit = observedByTime.get(key) ?? forecastByTime.get(key);
      const source = observedByTime.has(key)
        ? PrecipitationSource.AMEDAS_OBSERVATION
        : forecastByTime.has(key)
          ? PrecipitationSource.JMA_SHORT_RANGE_FORECAST
          : PrecipitationSource.OPEN_METEO_FORECAST;

      const baselineMillimeters = entry.rainFall.toNumber();
      if (!hit) {
        return {
          forecast: entry,
          source,
          baselineMillimeters,
          pointMillimeters: null,
          sourceTime: null,
        };
      }

      return {
        forecast: BallParkHourlyWeatherForecast.create({
          date: entry.date,
          weatherCode: entry.weatherPattern.code(),
          temperature: entry.temperature.toNumber(),
          precipitationProbability: entry.precipitationProbability.toRate(),
          rainFall: hit.millimeters,
          ballParkId: entry.ballParkId,
        }),
        source,
        baselineMillimeters,
        pointMillimeters: hit.pointMillimeters,
        sourceTime: hit.sourceTime,
      };
    });

    return {
      forecasts: slots.map((slot) => slot.forecast),
      slots,
    };
  }

  /**
   * 差し替えは「良くする」ための処理なので、失敗しても予測全体を止めない。
   * 取得に失敗したソースは空として扱い、そのスロットは Open-Meteo のまま残す。
   */
  private async safeFetch(
    load: () => Promise<PrecipitationSample[]>,
  ): Promise<PrecipitationSample[]> {
    try {
      return await load();
    } catch {
      return [];
    }
  }

  private indexByTime(
    samples: readonly PrecipitationSample[],
  ): Map<number, PrecipitationSample> {
    const index = new Map<number, PrecipitationSample>();
    for (const sample of samples) {
      if (!Number.isFinite(sample.millimeters) || sample.millimeters < 0) {
        continue;
      }
      index.set(sample.date.getTime(), sample);
    }
    return index;
  }
}
