import { BallParkHourlyWeatherForecastRepository } from "../../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { BallParkHourlyWeatherForecast } from "../../../../domain/weatherForecast/valueObjects/BallParkHourlyWeatherForecast";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { BallParkId } from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { R2ObjectStore } from "../R2ObjectStore";
import { ballParkHourlyWeatherForecastFileKey } from "../utils/keyBuilders";
import {
  listJstDateKeys,
  toJstDateKeyByParts,
} from "../utils/dateKeyGenerator";
import { ObjectStorageError } from "../../../../shared/errors/ObjectStorageError";

type HourlyRow = {
  date: string;
  weatherCode: number;
  temperature: number;
  precipitationProbability: number;
  rainFall: number;
  ballParkId: number;
};

const PREFIX = "hourly-weather/by-park/";

export class R2BallParkHourlyWeatherForecastRepository
  implements BallParkHourlyWeatherForecastRepository
{
  constructor(private readonly store: R2ObjectStore) {}

  // [delete] トランザクション非対応。現時点方針では no-op。
  withTransaction(
    _tx: TransactionContext
  ): BallParkHourlyWeatherForecastRepository {
    return this;
  }

  async updateMany(items: BallParkHourlyWeatherForecast[]): Promise<void> {
    // 引数を展開して、ballParkIdとdateをキーにグループ化
    const grouped = new Map<string, BallParkHourlyWeatherForecast[]>();
    for (const item of items) {
      const dateKey = toJstDateKeyByParts(item.date);
      const key = `${item.ballParkId}::${dateKey}`;
      const arrayByHour = grouped.get(key) ?? [];
      arrayByHour.push(item);
      grouped.set(key, arrayByHour);
    }

    try {
      await Promise.all(
        [...grouped.entries()].map(async ([key, arrayByHour]) => {
          const [ballParkIdStr, dateKey] = key.split("::");
          const ballParkId = Number(ballParkIdStr);
          const fileKey = ballParkHourlyWeatherForecastFileKey(
            ballParkId,
            dateKey
          );

          // 既存のデータを取得
          const existing =
            (await this.store.getJson<HourlyRow[]>(fileKey)) ?? [];
          // 既存のデータをマージするMapを作成
          const merged = new Map<string, HourlyRow>(
            existing.map((row) => [row.date, row])
          );

          for (const valueAtHour of arrayByHour) {
            const row: HourlyRow = {
              date: valueAtHour.date.toISOString(),
              weatherCode: valueAtHour.weatherPattern.code(),
              temperature: valueAtHour.temperature.toNumber(),
              precipitationProbability:
                valueAtHour.precipitationProbability.toPercent(),
              rainFall: valueAtHour.rainFall.toNumber(),
              ballParkId: valueAtHour.ballParkId,
            };
            merged.set(row.date, row);
          }

          const sorted = [...merged.values()].sort((a, b) =>
            a.date.localeCompare(b.date)
          );
          await this.store.putJson(fileKey, sorted);
        })
      );
    } catch (err: unknown) {
      throw new ObjectStorageError("時間別予報のupsertに失敗しました", {
        cause: err,
        details: { count: items.length },
      });
    }
  }

  async findAll(): Promise<BallParkHourlyWeatherForecast[]> {
    const keys = await this.store.listKeys(PREFIX);
    const jsonKeys = keys.filter((key) => key.endsWith(".json"));
    try {
      const allRows = (
        await Promise.all(
          jsonKeys.map((key) => this.store.getJson<HourlyRow[]>(key))
        )
      ).flatMap((value) => value ?? []);

      return allRows.map((row) =>
        BallParkHourlyWeatherForecast.create({
          date: new Date(row.date),
          weatherCode: row.weatherCode,
          temperature: row.temperature,
          precipitationProbability: row.precipitationProbability,
          rainFall: row.rainFall,
          ballParkId: row.ballParkId as BallParkId,
        })
      );
    } catch (err: unknown) {
      throw new ObjectStorageError("時間別予報の全件取得に失敗しました", {
        cause: err,
        details: { jsonKeys },
      });
    }
  }

  async findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: number
  ): Promise<BallParkHourlyWeatherForecast[]> {
    const dates = listJstDateKeys(from, to);

    try {
      const rows = (
        await Promise.all(
          dates.map((dateKey) =>
            this.store.getJson<HourlyRow[]>(
              ballParkHourlyWeatherForecastFileKey(ballParkId, dateKey)
            )
          )
        )
      )
        .flatMap((value) => value ?? [])
        .filter((row) => {
          const time = new Date(row.date).getTime();
          return from.getTime() <= time && time <= to.getTime();
        });

      return rows
        .map((row) =>
          BallParkHourlyWeatherForecast.create({
            date: new Date(row.date),
            weatherCode: row.weatherCode,
            temperature: row.temperature,
            precipitationProbability: row.precipitationProbability,
            rainFall: row.rainFall,
            ballParkId: row.ballParkId as BallParkId,
          })
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (err: unknown) {
      throw new ObjectStorageError(
        "日時範囲内の時間別予報の取得に失敗しました",
        {
          cause: err,
          details: { dates, ballParkId },
        }
      );
    }
  }
}
