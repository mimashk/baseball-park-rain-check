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
    private readonly ballParkHourlyWeatherForecastRepository: BallParkHourlyWeatherForecastRepository,
    private readonly batchStatusRepository: BatchStatusRepository,
    private readonly cancellationPredictionRepository: CancellationPredictionRepository
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

    const eligibleGameIds = games
      .filter((g) => g.ballPark.isOpenAir() && g.ballPark.id() !== 0)
      .map((g) => g.id.toString());

    const predictionMap =
      eligibleGameIds.length === 0
        ? new Map()
        : await this.cancellationPredictionRepository.findLatestByGameIds(
            eligibleGameIds
          );

    // ballParkごとに必要な時間帯の天気を先読み
    const weatherMapByPark = new Map<
      number,
      Map<number, BallParkHourlyWeatherForecast>
    >();
    const knownBallParkIds = Array.from(
      new Set(games.map((g) => g.ballPark.id()))
    ).filter((id) => id !== 0); // 未登録球場は除外

    await Promise.all(
      knownBallParkIds.map(async (ballParkId) => {
        const baseTimes = games
          .filter((g) => g.ballPark.id() === ballParkId)
          .map((g) => floorToJstHourUtc(g.date));
        const from = new Date(Math.min(...baseTimes.map((d) => d.getTime())));
        const to = new Date(Math.max(...baseTimes.map((d) => d.getTime())));
        const hourly =
          await this.ballParkHourlyWeatherForecastRepository.findByDateAndBallPark(
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

      const isKnown = game.ballPark.id() !== 0;
      const isOpenAir = game.ballPark.isOpenAir();

      const prediction = predictionMap.get(game.id.toString());

      const weatherAtGameTimeReason = !isKnown
        ? "UNKNOWN_BALLPARK"
        : weatherAtGameTime
        ? null
        : "PENDING";

      const cancelProbReason = !isKnown
        ? "UNKNOWN_BALLPARK"
        : !isOpenAir
        ? "INDOOR"
        : prediction
        ? null
        : "PENDING";

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
        weatherAtGameTimeReason,
        cancelProbPct: prediction?.probability ?? null,
        cancelProbReason,
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
