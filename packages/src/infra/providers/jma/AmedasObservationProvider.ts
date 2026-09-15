import {
  ObservedPrecipitationProvider,
  PrecipitationSample,
} from "../../../application/prediction/interfaces/PrecipitationSampleProvider";
import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { JmaTileClient } from "./JmaTileClient";

const BASE_URL = "https://www.jma.go.jp/bosai/amedas/data/point";

/** 観測所ごとのファイルは3時間ブロックで分かれている */
const BLOCK_HOURS = [0, 3, 6, 9, 12, 15, 18, 21] as const;

/** 品質情報。0 以外は欠測・疑問値なので採用しない */
const QUALITY_NORMAL = 0;

type AmedasValue = [number | null, number];
type AmedasPoint = Record<string, AmedasValue | unknown>;
type AmedasBlock = Record<string, AmedasPoint>;

/**
 * アメダスの実況から前1時間降水量を取り出す。
 *
 * ■ precipitation1h はローリング1時間
 * 09:10 の値は 08:10〜09:10 の積算であり、08:00〜09:00 ではない。
 * 予測スロットは正時で区切った1時間なので、**正時ちょうどの観測を読む**必要がある。
 * 最新の観測をそのまま使うと最大50分ずれた別の区間の値が入る。
 *
 * ■ 0.5mm 刻み
 * 転倒ます型雨量計のため観測値は 0.5mm 単位に量子化されている。
 * 1時間に 0.5mm 未満の霧雨は 0.0 と記録されるため、
 * 連続値で学習した `rainOccurRate` は下振れする方向にずれる。
 *
 * ■ 時刻はJST
 * アメダスの bosai エンドポイントは JST のタイムスタンプを使う。
 * タイル配信(UTC)とは異なるので取り違えないこと。
 */
export class AmedasObservationProvider implements ObservedPrecipitationProvider {
  constructor(private readonly client: JmaTileClient) {}

  async fetchObservedPrecipitation(
    ballParkId: BallParkId,
    slotTimes: readonly Date[],
  ): Promise<PrecipitationSample[]> {
    if (slotTimes.length === 0) return [];

    const stationId = BallParkWeatherPoint.create(ballParkId).amedasStationId();

    // 必要な3時間ブロックだけをまとめて取得する
    const blockKeys = new Set(
      slotTimes.map((slot) => this.toBlockKey(slot)),
    );
    const blocks = new Map<string, AmedasBlock>();
    await Promise.all(
      [...blockKeys].map(async (key) => {
        const url = `${BASE_URL}/${stationId}/${key}.json`;
        try {
          blocks.set(key, await this.client.fetchJson<AmedasBlock>(url));
        } catch {
          // 未来のブロックや保持期間外は取得できない。該当スロットは埋めずに進む
        }
      }),
    );

    const samples: PrecipitationSample[] = [];
    for (const slot of slotTimes) {
      const block = blocks.get(this.toBlockKey(slot));
      if (!block) continue;

      const point = block[this.toTimestamp(slot)];
      if (!point) continue;

      const millimeters = this.readPrecipitation1h(point);
      if (millimeters === null) continue;

      samples.push({
        date: slot,
        millimeters,
        // 点観測なので空間平均の概念が無い。降雨有無の判定もこの値で行う
        pointMillimeters: millimeters,
        sourceTime: slot,
      });
    }
    return samples;
  }

  /** 前1時間降水量を読む。欠測・疑問値は null */
  private readPrecipitation1h(point: AmedasPoint): number | null {
    const raw = point["precipitation1h"];
    if (!Array.isArray(raw) || raw.length < 2) return null;
    const [value, quality] = raw as AmedasValue;
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    if (quality !== QUALITY_NORMAL) return null;
    if (value < 0) return null;
    return value;
  }

  /** `{yyyyMMdd}_{HH}` 形式のブロックキー(JST) */
  private toBlockKey(date: Date): string {
    const jst = this.toJstParts(date);
    const blockHour = BLOCK_HOURS.reduce(
      (best, hour) => (jst.hour >= hour ? hour : best),
      BLOCK_HOURS[0],
    );
    return `${jst.year}${jst.month}${jst.day}_${String(blockHour).padStart(2, "0")}`;
  }

  /** `yyyyMMddHHmmss` 形式のタイムスタンプ(JST) */
  private toTimestamp(date: Date): string {
    const jst = this.toJstParts(date);
    return `${jst.year}${jst.month}${jst.day}${String(jst.hour).padStart(2, "0")}${jst.minute}${jst.second}`;
  }

  private toJstParts(date: Date) {
    // JST は固定オフセットなので、9時間ずらしてUTCとして読めばよい
    const shifted = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const pad = (value: number, length = 2) =>
      String(value).padStart(length, "0");
    return {
      year: pad(shifted.getUTCFullYear(), 4),
      month: pad(shifted.getUTCMonth() + 1),
      day: pad(shifted.getUTCDate()),
      hour: shifted.getUTCHours(),
      minute: pad(shifted.getUTCMinutes()),
      second: pad(shifted.getUTCSeconds()),
    };
  }
}
