// PrismaBallparkDailyWeatherForecastRepository.ts
import {
  BallPark,
  BallParkId,
} from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkDailyWeatherForecastRepository } from "../../../../domain/weatherForecast/repositoryInterface.ts/BallParkDailyWeatherForecastRepository";
import { BallParkDailyWeatherForecast } from "../../../../domain/weatherForecast/valueObjects/BallParkDailyWeatherForecast";
import { BallParkDailyWeatherForecastModel } from "../prisma/generate/models";
import { PrismaClientWrapper } from "../PrismaClientWrapper";

type BallParkDailyWeatherForecastPersistence = Omit<
  BallParkDailyWeatherForecastModel,
  "id" | "createdAt" | "updatedAt"
>;

export class PrismaBallparkDailyWeatherForecastRepository
  implements BallParkDailyWeatherForecastRepository
{
  private prisma = PrismaClientWrapper.getInstance();

  async updateMany(forecasts: BallParkDailyWeatherForecast[]): Promise<void> {
    const rows = forecasts.map(this.toPersistence);
    await this.prisma.$transaction(
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
  }

  async findAll(): Promise<BallParkDailyWeatherForecast[]> {
    const rows = await this.prisma.ballParkDailyWeatherForecast.findMany({
      orderBy: { date: "asc" },
    });
    return rows.map(this.toDomain);
  }

  private toPersistence(
    f: BallParkDailyWeatherForecast
  ): BallParkDailyWeatherForecastPersistence {
    return {
      date: f.date,
      weatherPattern: f.weatherPattern.labelJa(),
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
      weatherPattern: Number(row.weatherPattern),
      temperatureMin: row.temperatureMin,
      temperatureMax: row.temperatureMax,
      precipitationProbability: row.precipitationProbability,
      rainFall: row.rainFall,
      ballParkId: row.ballParkId as BallParkId,
    });
}
