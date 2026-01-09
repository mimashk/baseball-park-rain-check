import { PrismaClientWrapper } from "../PrismaClientWrapper";
import { BallParkObservedHourlyWeatherRepository } from "../../../../domain/training/repositoryInterface/BallParkObservedHourlyWeatherRepository";
import { BallParkObservedHourlyWeather } from "../../../../domain/training/valueObjects/BallParkObservedHourlyWeather";
import { RainFall } from "../../../../domain/weatherForecast/valueObjects/RainFall";
import { TemperatureCelsius } from "../../../../domain/weatherForecast/valueObjects/Temperature";
import { BallParkObservedHourlyWeatherModel } from "../prisma/generate/models";
import { BallParkId } from "../../../../domain/scheduledGame/valueObjects/BallPark";

type BallParkObservedHourlyWeatherPersistence = Omit<
  BallParkObservedHourlyWeatherModel,
  "id" | "createdAt" | "updatedAt"
>;

export class PrismaBallParkObservedHourlyWeatherRepository
  implements BallParkObservedHourlyWeatherRepository
{
  private prisma = PrismaClientWrapper.getInstance();

  async upsertMany(
    observedHourlyWeathers: BallParkObservedHourlyWeather[]
  ): Promise<void> {
    const rows = observedHourlyWeathers.map(this.toPersistence);
    await this.prisma.$transaction(
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
  }

  async findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: number
  ): Promise<BallParkObservedHourlyWeather[]> {
    const rows = await this.prisma.ballParkObservedHourlyWeather.findMany({
      where: { date: { gte: from, lte: to }, ballParkId },
      orderBy: { date: "asc" },
    });
    return rows.map(this.toDomain);
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
