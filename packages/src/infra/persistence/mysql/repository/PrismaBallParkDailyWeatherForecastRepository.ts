import {
  BallPark,
  BallParkId,
} from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { BallParkDailyWeatherForecastRepository } from "../../../../domain/weatherForecast/repositoryInterface.ts/BallParkDailyWeatherForecastRepository";
import { BallParkDailyWeatherForecast } from "../../../../domain/weatherForecast/valueObjects/BallParkDailyWeatherForecast";
import { AppError } from "../../../../shared/errors/AppError";
import { DbError } from "../../../../shared/errors/DbError";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { PrismaClient } from "../prisma/generate/client";
import { BallParkDailyWeatherForecastModel } from "../prisma/generate/models";
import { PrismaClientWrapper } from "../PrismaClientWrapper";

type BallParkDailyWeatherForecastPersistence = Omit<
  BallParkDailyWeatherForecastModel,
  "id" | "createdAt" | "updatedAt"
>;

export class PrismaBallParkDailyWeatherForecastRepository
  implements BallParkDailyWeatherForecastRepository
{
  constructor(
    private readonly prisma: PrismaClient = PrismaClientWrapper.getInstance()
  ) {}

  withTransaction(
    tx: TransactionContext
  ): BallParkDailyWeatherForecastRepository {
    return new PrismaBallParkDailyWeatherForecastRepository(
      tx as unknown as PrismaClient
    );
  }

  async updateMany(forecasts: BallParkDailyWeatherForecast[]): Promise<void> {
    const rows = forecasts.map(this.toPersistence);
    try {
      await Promise.all(
        rows.map((row) =>
          this.prisma.ballParkDailyWeatherForecast.upsert({
            where: {
              ballParkId_date: { ballParkId: row.ballParkId, date: row.date },
            },
            create: row,
            update: row,
          })
        )
      );
    } catch (err) {
      throw new DbError("日次予報のupsertに失敗しました", {
        cause: err,
        details: { count: rows.length },
      });
    }
  }

  async findAll(): Promise<BallParkDailyWeatherForecast[]> {
    let rows: BallParkDailyWeatherForecastModel[];
    try {
      rows = await this.prisma.ballParkDailyWeatherForecast.findMany({
        orderBy: { date: "asc" },
      });
    } catch (err) {
      throw new DbError("日次予報の取得に失敗しました", { cause: err });
    }
    try {
      return rows.map(this.toDomain);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new InfrastructureError(
        "mapping",
        "DBレコードをドメインに変換できません",
        {
          cause: err,
        }
      );
    }
  }

  private toPersistence(
    f: BallParkDailyWeatherForecast
  ): BallParkDailyWeatherForecastPersistence {
    return {
      date: f.date,
      weatherCode: f.weatherPattern.code(),
      temperatureMin: f.temperatureMin.toNumber(),
      temperatureMax: f.temperatureMax.toNumber(),
      precipitationProbability: f.precipitationProbability.toPercent(),
      rainFall: f.rainFall.toNumber(),
      ballParkId: f.ballParkId,
    };
  }

  private toDomain = (
    row: BallParkDailyWeatherForecastPersistence
  ): BallParkDailyWeatherForecast =>
    BallParkDailyWeatherForecast.create({
      date: row.date,
      weatherCode: Number(row.weatherCode),
      temperatureMin: row.temperatureMin,
      temperatureMax: row.temperatureMax,
      precipitationProbability: row.precipitationProbability,
      rainFall: row.rainFall,
      ballParkId: row.ballParkId as BallParkId,
    });
}
