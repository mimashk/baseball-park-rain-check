import {
  PrecipitationSample,
  ShortRangePrecipitationForecastProvider,
} from "../../../application/prediction/interfaces/PrecipitationSampleProvider";
import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { DecodedImage, PngDecoder } from "./decoders/PngDecoder";
import { JmaTargetTimeCatalog } from "./JmaTargetTimeCatalog";
import {
  JmaTileElement,
  JmaTileEndpoints,
  JmaTileProduct,
} from "./JmaTileEndpoints";
import { JmaTileClient, TILE_NOT_FOUND } from "./JmaTileClient";
import { TileCoordinate, TileIndex } from "./utils/TileCoordinate";
import { TilePrecipitationSampler } from "./utils/TilePrecipitationSampler";

export interface JmaShortRangeForecastConfig {
  /**
   * タイルのズームレベル。
   * z=8 で1ピクセル約0.5km。降水短時間予報の格子が1kmなので、これ以上細かくしても情報は増えない。
   */
  readonly zoom: number;
  /**
   * 空間平均を取る窓の一辺(km)。
   * 値が8階級に量子化されているため、複数画素を平均して中間の値を復元する狙い。
   * 学習に使った ERA5 が25kmグリッドの平均値である点も判断材料になる。
   * 較正(フェーズ4)で実測して決める。
   */
  readonly windowSizeKm: number;
  /**
   * 窓内で「既知のどの階級色にも一致しない画素」がこの割合を超えたら、
   * 値が信用できないとみなして採用しない。
   */
  readonly maxUnknownRatio: number;
  /**
   * 1スロットあたり何世代前の正時ランまで遡って試すか。
   *
   * リード7時間のスロットは、直近のランでは範囲外になる
   * (6時間予報は1〜6時間先、15時間予報は8〜15時間先を配信するため7時間先に隙間がある)。
   * 1つ前のランに遡ればリード8時間として取得できるので、最低でも2は必要。
   */
  readonly maxBasetimeFallbacks: number;
}

export const DEFAULT_JMA_SHORT_RANGE_FORECAST_CONFIG: JmaShortRangeForecastConfig =
  {
    zoom: 8,
    windowSizeKm: 5,
    maxUnknownRatio: 0.1,
    maxBasetimeFallbacks: 3,
  };

/** 配信されている最大のリード時間。これを超えるスロットは最初から諦める */
const MAX_LEAD_HOURS = 15;

const HOUR_MS = 3_600_000;

/**
 * 気象庁の降水短時間予報タイルから前1時間降水量を取り出す。
 *
 * ■ 使えるのは正時のランだけ
 * validtime は basetime の「分」に追随する。basetime 09:10 のランは
 * validtime も 10:10, 11:10 … となり、正時スロットとは別の1時間を指す。
 * 予測スロットは常に正時なので、実際に噛み合うのは `:00` のランだけになる。
 * ずれた時刻のランで代用すると7スロットすべてが同じ方向にずれ、
 * 誤差が打ち消し合わず系統的なバイアスになるため、代用はしない。
 *
 * ■ basetime は組み立てる。一覧には頼らない
 * `targetTimes.json` は予報ランを最新しか保持しないため、
 * 正時のランが実在してタイルも配信されているのに一覧から消える
 * (09:30 のランが載ると 09:00 のランは消える)。
 * そこで正時の basetime を自分で組み立て、404なら1つ前の世代へ遡る方式にしている。
 * 古い basetime のタイルも2時間程度は配信され続けることを実測で確認済み。
 *
 * ■ 値は8階級
 * 無料で取れるのはPNGタイルなので、降水量が8階級に量子化されている。
 * 階級から代表値への変換は `PrecipitationColorScale` に切り出してあり、較正で差し替えられる。
 */
export class JmaShortRangeForecastProvider
  implements ShortRangePrecipitationForecastProvider
{
  constructor(
    private readonly client: JmaTileClient,
    private readonly config: JmaShortRangeForecastConfig = DEFAULT_JMA_SHORT_RANGE_FORECAST_CONFIG,
  ) {}

  async fetchForecastPrecipitation(
    ballParkId: BallParkId,
    slotTimes: readonly Date[],
  ): Promise<PrecipitationSample[]> {
    if (slotTimes.length === 0) return [];

    const point = BallParkWeatherPoint.create(ballParkId);
    const { zoom, windowSizeKm } = this.config;

    const center = TileCoordinate.toGlobalPixel(
      point.latitude(),
      point.longitude(),
      zoom,
    );
    const radiusPixels = TileCoordinate.radiusPixelsForKilometers(
      windowSizeKm / 2,
      point.latitude(),
      zoom,
    );
    const tiles = TileCoordinate.tilesCoveringWindow(center, radiusPixels, zoom);

    // 配信側の現在時刻。ローカル時計のずれと公開ラグを織り込んだ基準になる
    const publishedUntil = await this.loadPublishedUntil();

    // 同じタイルを複数スロットで引くことがあるので、この呼び出しの中だけキャッシュする
    const tileCache = new Map<string, DecodedImage | null>();

    const samples: PrecipitationSample[] = [];
    for (const slot of slotTimes) {
      const sample = await this.resolveSlot(
        slot,
        publishedUntil,
        tiles,
        center,
        radiusPixels,
        tileCache,
      );
      if (sample) samples.push(sample);
    }
    return samples;
  }

  private async resolveSlot(
    slot: Date,
    publishedUntil: Date,
    tiles: readonly TileIndex[],
    center: { x: number; y: number },
    radiusPixels: number,
    tileCache: Map<string, DecodedImage | null>,
  ): Promise<PrecipitationSample | null> {
    for (const basetime of this.candidateBasetimes(slot, publishedUntil)) {
      const decoded = await this.loadTiles(basetime, slot, tiles, tileCache);
      if (decoded.size === 0) continue;

      const result = TilePrecipitationSampler.sample(
        decoded,
        center,
        radiusPixels,
      );
      const read = result.sampleCount + result.unknownCount;
      if (read > 0 && result.unknownCount / read > this.config.maxUnknownRatio) {
        // 想定外の色が多いときは配信形式が変わった可能性がある。値を使わず退避させる
        return null;
      }

      return {
        date: slot,
        millimeters: result.meanMm,
        pointMillimeters: result.centerMm,
        sourceTime: basetime,
      };
    }
    return null;
  }

  /**
   * 試す正時 basetime を新しい順に並べる。
   * スロットより後のランは存在しないので、スロットの1時間前を上限にする。
   */
  private candidateBasetimes(slot: Date, publishedUntil: Date): Date[] {
    const newestPossible = Math.min(
      this.floorToHour(publishedUntil).getTime(),
      this.floorToHour(new Date(slot.getTime() - HOUR_MS)).getTime(),
    );

    const candidates: Date[] = [];
    for (let i = 0; i < this.config.maxBasetimeFallbacks; i++) {
      const basetime = new Date(newestPossible - i * HOUR_MS);
      const leadHours = (slot.getTime() - basetime.getTime()) / HOUR_MS;
      if (leadHours > MAX_LEAD_HOURS) break;
      if (leadHours < 1) continue;
      candidates.push(basetime);
    }
    return candidates;
  }

  private async loadTiles(
    basetime: Date,
    validtime: Date,
    tiles: readonly TileIndex[],
    tileCache: Map<string, DecodedImage | null>,
  ): Promise<Map<string, DecodedImage>> {
    const decoded = new Map<string, DecodedImage>();
    for (const tile of tiles) {
      const url = JmaTileEndpoints.tile({
        product: JmaTileProduct.PRECIPITATION_SHORT_RANGE_FORECAST,
        basetime: JmaTargetTimeCatalog.toTimestamp(basetime),
        validtime: JmaTargetTimeCatalog.toTimestamp(validtime),
        element: JmaTileElement.HOURLY_PRECIPITATION,
        zoom: this.config.zoom,
        x: tile.x,
        y: tile.y,
      });

      let image = tileCache.get(url);
      if (image === undefined) {
        const body = await this.client.fetchTile(url);
        image = body === TILE_NOT_FOUND ? null : PngDecoder.decodeToRgba(body);
        tileCache.set(url, image);
      }
      if (image) decoded.set(TilePrecipitationSampler.tileKey(tile), image);
    }
    return decoded;
  }

  /** 配信側が公開済みの最新時刻を返す。取得できなければローカル時計で代用する */
  private async loadPublishedUntil(): Promise<Date> {
    try {
      const url = JmaTileEndpoints.targetTimes(
        JmaTileProduct.PRECIPITATION_SHORT_RANGE_FORECAST,
      );
      const catalog = JmaTargetTimeCatalog.fromJson(
        await this.client.fetchJson(url),
      );
      return JmaTargetTimeCatalog.toDate(catalog.latestBasetime());
    } catch {
      return new Date();
    }
  }

  private floorToHour(date: Date): Date {
    const floored = new Date(date);
    floored.setUTCMinutes(0, 0, 0);
    return floored;
  }
}
