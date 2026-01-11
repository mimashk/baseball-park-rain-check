import { BallParkId } from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { BallParkHourlyWeatherForecastRepository } from "../../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { BallParkHourlyWeatherForecast } from "../../../../domain/weatherForecast/valueObjects/BallParkHourlyWeatherForecast";
import { AppError } from "../../../../shared/errors/AppError";
import { DbError } from "../../../../shared/errors/DbError";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { PrismaClient } from "@prisma/client";
import { BallParkHourlyWeatherForecast as BallParkHourlyWeatherForecastModel } from "@prisma/client";
import { PrismaClientWrapper } from "../PrismaClientWrapper";

type BallParkHourlyWeatherForecastPersistence = Omit<
  BallParkHourlyWeatherForecastModel,
  "id" | "createdAt" | "updatedAt"
>;

export class PrismaBallParkHourlyWeatherForecastRepository
  implements BallParkHourlyWeatherForecastRepository
{
  constructor(
    private readonly prisma: PrismaClient = PrismaClientWrapper.getInstance()
  ) {}

  withTransaction(
    tx: TransactionContext
  ): BallParkHourlyWeatherForecastRepository {
    return new PrismaBallParkHourlyWeatherForecastRepository(
      tx as unknown as PrismaClient
    );
  }
  async updateMany(forecasts: BallParkHourlyWeatherForecast[]): Promise<void> {
    const rows = forecasts.map(this.toPersistence);
    try {
      await Promise.all(
        rows.map((row) =>
          this.prisma.ballParkHourlyWeatherForecast.upsert({
            where: {
              ballParkId_date: { ballParkId: row.ballParkId, date: row.date },
            },
            create: row,
            update: row,
          })
        )
      );
    } catch (err) {
      throw new DbError("時間別予報のupsertに失敗しました", {
        cause: err,
        details: { count: rows.length },
      });
    }
  }

  async findAll(): Promise<BallParkHourlyWeatherForecast[]> {
    let rows: BallParkHourlyWeatherForecastModel[];
    try {
      rows = await this.prisma.ballParkHourlyWeatherForecast.findMany({
        orderBy: { date: "asc" },
      });
    } catch (err) {
      throw new DbError("時間別予報の取得に失敗しました", { cause: err });
    }
    return this.mapRows(rows);
  }

  async findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: number
  ): Promise<BallParkHourlyWeatherForecast[]> {
    let rows: BallParkHourlyWeatherForecastModel[];
    try {
      rows = await this.prisma.ballParkHourlyWeatherForecast.findMany({
        where: { date: { gte: from, lte: to }, ballParkId },
        orderBy: { date: "asc" },
      });
    } catch (err) {
      throw new DbError("時間別予報の取得に失敗しました", {
        cause: err,
        details: { from, to, ballParkId },
      });
    }
    return this.mapRows(rows);
  }

  private mapRows(
    rows: BallParkHourlyWeatherForecastModel[]
  ): BallParkHourlyWeatherForecast[] {
    try {
      return rows.map(this.toDomain);
    } catch (err) {
      if (err instanceof AppError) throw err; // ドメインの Validation/DomainError はそのまま
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
    f: BallParkHourlyWeatherForecast
  ): BallParkHourlyWeatherForecastPersistence {
    return {
      date: f.date,
      weatherCode: f.weatherPattern.code(),
      temperature: f.temperature.toNumber(),
      precipitationProbability: f.precipitationProbability.toPercent(),
      rainFall: f.rainFall.toNumber(),
      ballParkId: f.ballParkId,
    };
  }

  private toDomain = (
    row: BallParkHourlyWeatherForecastPersistence
  ): BallParkHourlyWeatherForecast =>
    BallParkHourlyWeatherForecast.create({
      date: row.date,
      weatherCode: Number(row.weatherCode),
      temperature: row.temperature,
      precipitationProbability: row.precipitationProbability,
      rainFall: row.rainFall,
      ballParkId: row.ballParkId as BallParkId,
    });
}
