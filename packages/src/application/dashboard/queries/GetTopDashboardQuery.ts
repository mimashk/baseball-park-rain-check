import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { BallParkHourlyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { GetTopDashboardOutput } from "../dtos/GetTopDashboardOutput";
import { DashboardGameDto } from "../dtos/DashboardGameDto";
import { BatchStatusRepository } from "../interfaces/BatchStatusRepository";
import {
  floorToJstHourUtc,
  jstDayRangeUtc,
  toHourKeyUtc,
  toJstDateString,
} from "../utils/jst";
import { BaseballTeam } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { CancellationPredictionRepository } from "../../prediction/interfaces/CancellationPredictionRepository";
import { GetTopDashboardInput } from "../dtos/GetTopDashboardInput";
import { BallParkHourlyWeatherForecast } from "../../../domain/weatherForecast/valueObjects/BallParkHourlyWeatherForecast";

export class GetTopDashboardQuery {
  constructor(
    private readonly scheduledGameRepository: ScheduledGameRepository,
    private readonly hourlyRepository: BallParkHourlyWeatherForecastRepository,
    private readonly batchStatusRepository: BatchStatusRepository,
    private readonly predictionRepository: CancellationPredictionRepository
  ) {}

  async execute(req: GetTopDashboardInput): Promise<GetTopDashboardOutput> {
    const date = req.dateJst ?? toJstDateString(new Date());
    const { startUtc, endUtc } = jstDayRangeUtc(date);

    const games = await this.scheduledGameRepository.findByDate(
      startUtc,
      endUtc
    );

    const batchCompletedAt =
      (await this.batchStatusRepository.findLatestCompletedAtUtc()) ??
      new Date();

    if (!games.length) {
      return {
        batchCompletedAtUtc: batchCompletedAt.toISOString(),
        dateJst: date,
        games: [],
      };
    }

    const gameIds = games.map((g) => g.id.toString());
    const predictions = await this.predictionRepository.findLatestByGameIds(
      gameIds
    );

    // ballParkごとに必要な時間帯の天気を先読み
    const weatherMapByPark = new Map<
      number,
      Map<number, BallParkHourlyWeatherForecast>
    >();
    const ballParkIds = Array.from(new Set(games.map((g) => g.ballPark.id())));

    await Promise.all(
      ballParkIds.map(async (ballParkId) => {
        const baseTimes = games
          .filter((g) => g.ballPark.id() === ballParkId)
          .map((g) => floorToJstHourUtc(g.date));
        const from = new Date(Math.min(...baseTimes.map((d) => d.getTime())));
        const to = new Date(Math.max(...baseTimes.map((d) => d.getTime())));
        const hourly = await this.hourlyRepository.findByDateAndBallPark(
          from,
          to,
          ballParkId
        );
        weatherMapByPark.set(
          ballParkId,
          new Map(hourly.map((h) => [toHourKeyUtc(h.date), h]))
        );
      })
    );

    const gamesDto: DashboardGameDto[] = games.map((game) => {
      const baseUtc = floorToJstHourUtc(game.date);
      const hourlyMap = weatherMapByPark.get(game.ballPark.id()) ?? new Map();
      const weatherAtGameTime = hourlyMap.get(toHourKeyUtc(baseUtc)) ?? null;

      const prediction = predictions.get(game.id.toString());

      return {
        gameId: game.id.toString(),
        startAtUtc: game.date.toISOString(),
        ballpark: game.ballPark.name(),
        status: this.mapStatus(game.status().value),
        home: {
          teamId: game.homeTeam.id(),
          name: BaseballTeam.from(game.homeTeam.id()).labelJa(),
        },
        away: {
          teamId: game.awayTeam.id(),
          name: BaseballTeam.from(game.awayTeam.id()).labelJa(),
        },
        weatherAtGameTime: weatherAtGameTime
          ? {
              text: weatherAtGameTime.weatherPattern.labelJa(),
              wmoCode: weatherAtGameTime.weatherPattern.code(),
              temperatureC: weatherAtGameTime.temperature.toNumber(),
              precipProbPct:
                weatherAtGameTime.precipitationProbability.toPercent(),
              precipMm: weatherAtGameTime.rainFall.toNumber(),
            }
          : null,
        cancelProbPct: prediction?.probability ?? null,
      };
    });

    return {
      batchCompletedAtUtc: batchCompletedAt.toISOString(),
      dateJst: date,
      games: gamesDto,
    };
  }

  private mapStatus(status: string): DashboardGameDto["status"] {
    const map: Record<string, DashboardGameDto["status"]> = {
      [GameStatusType.SCHEDULED]: "SCHEDULED",
      [GameStatusType.IN_PROGRESS]: "IN_PROGRESS",
      [GameStatusType.CANCELLED]: "CANCELLED",
      [GameStatusType.COMPLETED]: "COMPLETED",
    };
    return map[status] ?? "SCHEDULED";
  }
}
