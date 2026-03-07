import { BallParkDailyWeatherForecastRepository } from "../../../../domain/weatherForecast/repositoryInterface.ts/BallParkDailyWeatherForecastRepository";
import { BallParkDailyWeatherForecast } from "../../../../domain/weatherForecast/valueObjects/BallParkDailyWeatherForecast";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { BallParkId } from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { R2ObjectStore } from "../R2ObjectStore";
import {
  listJstDateKeys,
  toJstDateKeyByParts,
} from "../utils/dateKeyGenerator";
import { ballParkDailyWeatherForecastFileKey } from "../utils/keyBuilders";
import { ObjectStorageError } from "../../../../shared/errors/ObjectStorageError";

type DailyRow = {
  date: string;
  weatherCode: number;
  temperatureMin: number;
  temperatureMax: number;
  precipitationProbability: number;
  rainFall: number;
  ballParkId: number;
};

const PREFIX = "daily-weather/by-park/";

export class R2BallParkDailyWeatherForecastRepository
  implements BallParkDailyWeatherForecastRepository
{
  constructor(private readonly store: R2ObjectStore) {}

  async updateMany(items: BallParkDailyWeatherForecast[]): Promise<void> {
    try {
      await Promise.all(
        items.map(async (item) => {
          const key = ballParkDailyWeatherForecastFileKey(
            item.ballParkId,
            toJstDateKeyByParts(item.date)
          );
          const row: DailyRow = {
            date: item.date.toISOString(),
            weatherCode: item.weatherPattern.code(),
            temperatureMin: item.temperatureMin.toNumber(),
            temperatureMax: item.temperatureMax.toNumber(),
            precipitationProbability: item.precipitationProbability.toRate(),
            rainFall: item.rainFall.toNumber(),
            ballParkId: item.ballParkId,
          };
          await this.store.putJson(key, row);
        })
      );
    } catch (err: unknown) {
      throw new ObjectStorageError("日次予報のupsertに失敗しました", {
        cause: err,
        details: { count: items.length },
      });
    }
  }

  async findAll(): Promise<BallParkDailyWeatherForecast[]> {
    const keys = await this.store.listKeys(PREFIX);
    const jsonKeys = keys.filter((key) => key.endsWith(".json"));
    try {
      const rows = (
        await Promise.all(
          jsonKeys.map((key) => this.store.getJson<DailyRow>(key))
        )
      ).filter((value): value is DailyRow => Boolean(value));

      return rows.map((row) =>
        BallParkDailyWeatherForecast.create({
          date: new Date(row.date),
          weatherCode: row.weatherCode,
          temperatureMin: row.temperatureMin,
          temperatureMax: row.temperatureMax,
          precipitationProbability: row.precipitationProbability,
          rainFall: row.rainFall,
          ballParkId: row.ballParkId as BallParkId,
        })
      );
    } catch (err: unknown) {
      throw new ObjectStorageError("日次予報の全件取得に失敗しました", {
        cause: err,
        details: { jsonKeys },
      });
    }
  }

  async findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: number
  ): Promise<BallParkDailyWeatherForecast[]> {
    const dates = listJstDateKeys(from, to);
    try {
      const rows = (
        await Promise.all(
          dates.map((dateKey) =>
            this.store.getJson<DailyRow>(
              ballParkDailyWeatherForecastFileKey(ballParkId, dateKey)
            )
          )
        )
      )
        .filter((value): value is DailyRow => Boolean(value))
        .filter((row) => {
          const time = new Date(row.date).getTime();
          return from.getTime() <= time && time <= to.getTime();
        });

      return rows
        .map((row) =>
          BallParkDailyWeatherForecast.create({
            date: new Date(row.date),
            weatherCode: row.weatherCode,
            temperatureMin: row.temperatureMin,
            temperatureMax: row.temperatureMax,
            precipitationProbability: row.precipitationProbability,
            rainFall: row.rainFall,
            ballParkId: row.ballParkId as BallParkId,
          })
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (err: unknown) {
      throw new ObjectStorageError("日時範囲内の日次予報の取得に失敗しました", {
        cause: err,
        details: { dates, ballParkId },
      });
    }
  }
}
