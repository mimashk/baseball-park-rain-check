// PrismaBallparkHourlyWeatherForecastRepository.ts
import { BallParkId } from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkHourlyWeatherForecastRepository } from "../../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { BallParkHourlyWeatherForecast } from "../../../../domain/weatherForecast/valueObjects/BallParkHourlyWeatherForecast";
import { BallParkHourlyWeatherForecastModel } from "../prisma/generate/models";
import { PrismaClientWrapper } from "../PrismaClientWrapper";

type BallParkHourlyWeatherForecastPersistence = Omit<
  BallParkHourlyWeatherForecastModel,
  "id" | "createdAt" | "updatedAt"
>;

export class PrismaBallparkHourlyWeatherForecastRepository
  implements BallParkHourlyWeatherForecastRepository
{
  private prisma = PrismaClientWrapper.getInstance();

  async updateMany(forecasts: BallParkHourlyWeatherForecast[]): Promise<void> {
    const rows = forecasts.map(this.toPersistence);
    await this.prisma.$transaction(
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
  }

  async findAll(): Promise<BallParkHourlyWeatherForecast[]> {
    const rows = await this.prisma.ballParkHourlyWeatherForecast.findMany({
      orderBy: { date: "asc" },
    });
    return rows.map(this.toDomain);
  }

  async findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: number
  ): Promise<BallParkHourlyWeatherForecast[]> {
    const rows = await this.prisma.ballParkHourlyWeatherForecast.findMany({
      where: { date: { gte: from, lte: to }, ballParkId },
      orderBy: { date: "asc" },
    });
    return rows.map(this.toDomain);
  }

  private toPersistence(
    f: BallParkHourlyWeatherForecast
  ): BallParkHourlyWeatherForecastPersistence {
    return {
      date: f.date,
      weatherPattern: f.weatherPattern.labelJa(),
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
      weatherPattern: Number(row.weatherPattern),
      temperature: row.temperature,
      precipitationProbability: row.precipitationProbability,
      rainFall: row.rainFall,
      ballParkId: row.ballParkId as BallParkId,
    });
}
