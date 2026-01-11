import { BallParkObservedHourlyWeatherRepository } from "../../../../domain/training/repositoryInterface/BallParkObservedHourlyWeatherRepository";
import { BallParkObservedHourlyWeather } from "../../../../domain/training/valueObjects/BallParkObservedHourlyWeather";
import { RainFall } from "../../../../domain/weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../../../domain/weatherForecast/valueObjects/Temperature";
import { BallParkObservedHourlyWeatherModel } from "../prisma/generate/models";
import { BallParkId } from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { DbError } from "../../../../shared/errors/DbError";
import { AppError } from "../../../../shared/errors/AppError";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { PrismaClient } from "../prisma/generate/client";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { PrismaClientWrapper } from "../PrismaClientWrapper";

type BallParkObservedHourlyWeatherPersistence = Omit<
  BallParkObservedHourlyWeatherModel,
  "id" | "createdAt" | "updatedAt"
>;

export class PrismaBallParkObservedHourlyWeatherRepository
  implements BallParkObservedHourlyWeatherRepository
{
  constructor(
    private readonly prisma: PrismaClient = PrismaClientWrapper.getInstance()
  ) {}

  withTransaction(
    tx: TransactionContext
  ): BallParkObservedHourlyWeatherRepository {
    return new PrismaBallParkObservedHourlyWeatherRepository(
      tx as unknown as PrismaClient
    );
  }

  async upsertMany(
    observedHourlyWeathers: BallParkObservedHourlyWeather[]
  ): Promise<void> {
    const rows = observedHourlyWeathers.map(this.toPersistence);
    try {
      await Promise.all(
        rows.map((row) =>
          this.prisma.ballParkObservedHourlyWeather.upsert({
            where: {
              ballParkId_date: { ballParkId: row.ballParkId, date: row.date },
            },
            create: row,
            update: row,
          })
        )
      );
    } catch (err) {
      throw new DbError("観測データのupsertに失敗しました", {
        cause: err,
        details: { count: rows.length },
      });
    }
  }

  async findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: number
  ): Promise<BallParkObservedHourlyWeather[]> {
    let rows: BallParkObservedHourlyWeatherModel[];
    try {
      rows = await this.prisma.ballParkObservedHourlyWeather.findMany({
        where: { date: { gte: from, lte: to }, ballParkId },
        orderBy: { date: "asc" },
      });
    } catch (err) {
      throw new DbError("観測データの取得に失敗しました", {
        cause: err,
        details: { from, to, ballParkId },
      });
    }
    try {
      return rows.map(this.toDomain);
    } catch (err) {
      if (err instanceof AppError) throw err; // ドメインの ValidationError/DomainError はそのまま
      throw new InfrastructureError(
        "mapping",
        "DBレコードをドメインに変換できません",
        {
          cause: err,
        }
      );
    }
  }

  private toPersistence = (
    v: BallParkObservedHourlyWeather
  ): BallParkObservedHourlyWeatherPersistence => ({
    date: v.date,
    temperature: v.temperature.toNumber(),
    rainfallOccurred: v.rainfallOccurred.toNumber() === 1,
    rainFall: v.rainFall.toNumber(),
    ballParkId: v.ballParkId,
  });

  private toDomain = (
    row: BallParkObservedHourlyWeatherPersistence
  ): BallParkObservedHourlyWeather =>
    BallParkObservedHourlyWeather.create({
      date: row.date,
      temperature: TemperatureCelsius.from(row.temperature).toNumber(), // createはnumber受け取り
      rainFall: RainFall.fromMillimeters(row.rainFall).toNumber(), // createはnumber受け取り
      ballParkId: row.ballParkId as BallParkId,
    });
}
