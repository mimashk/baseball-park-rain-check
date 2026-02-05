import { BallParkId } from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { BallParkDailyWeatherForecastRepository } from "../../../../domain/weatherForecast/repositoryInterface.ts/BallParkDailyWeatherForecastRepository";
import { BallParkDailyWeatherForecast } from "../../../../domain/weatherForecast/valueObjects/BallParkDailyWeatherForecast";
import { AppError } from "../../../../shared/errors/AppError";
import { DbError } from "../../../../shared/errors/DbError";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { Prisma, PrismaClient } from "@prisma/client";
import { BallParkDailyWeatherForecast as BallParkDailyWeatherForecastModel } from "@prisma/client";
import { PrismaClientWrapper } from "../PrismaClientWrapper";

type BallParkDailyWeatherForecastPersistence = Omit<
  BallParkDailyWeatherForecastModel,
  "id" | "createdAt" | "updatedAt"
>;

export class PrismaBallParkDailyWeatherForecastRepository
  implements BallParkDailyWeatherForecastRepository
{
  constructor(
    private readonly prisma: PrismaClient = PrismaClientWrapper.getInstance(),
    private readonly trx?: Prisma.TransactionClient
  ) {}

  withTransaction(
    trx: TransactionContext
  ): BallParkDailyWeatherForecastRepository {
    return new PrismaBallParkDailyWeatherForecastRepository(
      this.prisma,
      trx as unknown as Prisma.TransactionClient
    );
  }

  private db() {
    return this.trx ?? this.prisma;
  }

  async updateMany(forecasts: BallParkDailyWeatherForecast[]): Promise<void> {
    const rows = forecasts.map(this.toPersistence);
    try {
      await Promise.all(
        rows.map((row) =>
          this.db().ballParkDailyWeatherForecast.upsert({
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
      rows = await this.db().ballParkDailyWeatherForecast.findMany({
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

  async findByDateAndBallPark(from: Date, to: Date, ballParkId: number) {
    let rows: BallParkDailyWeatherForecastModel[];
    try {
      rows = await this.db().ballParkDailyWeatherForecast.findMany({
        where: { date: { gte: from, lte: to }, ballParkId },
        orderBy: { date: "asc" },
      });
    } catch (err) {
      throw new DbError("日次予報の取得に失敗しました", {
        cause: err,
        details: { from, to, ballParkId },
      });
    }
    return rows.map(this.toDomain);
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
