import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { BallParkHourlyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { BallParkDailyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkDailyWeatherForecastRepository";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { DomainError } from "../../../shared/errors/DomainError";
import { GetTeamDashboardOutput } from "../dtos/GetTeamDashboardOutput";
import { GetTeamDashboardInput } from "../dtos/GetTeamDashboardInput";
import {
  addDaysJst,
  addHours,
  floorToJstHourUtc,
  jstDayRangeUtc,
  toHourKeyUtc,
  toJstDateString,
} from "../utils/jst";
import { BaseballTeam } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { DashboardGameDto } from "../dtos/DashboardGameDto";
import { BatchStatusRepository } from "../interfaces/BatchStatusRepository";
import { CancellationPredictionRepository } from "../../../application/prediction/interfaces/CancellationPredictionRepository";

export class GetTeamDashboardQuery {
  constructor(
    private readonly scheduledGameRepository: ScheduledGameRepository,
    private readonly ballParkHourlyWeatherForecastRepository: BallParkHourlyWeatherForecastRepository,
    private readonly ballParkDailyWeatherForecastRepository: BallParkDailyWeatherForecastRepository,
    private readonly batchStatusRepository: BatchStatusRepository,
    private readonly cancellationPredictionRepository: CancellationPredictionRepository
  ) {}

  async execute(req: GetTeamDashboardInput): Promise<GetTeamDashboardOutput> {
    try {
      const dateJst = req.dateJst ?? toJstDateString(new Date());
      const teamId = BaseballTeam.from(req.teamId).id();
      if (!teamId) {
        throw new ValidationError("チームIDが不正です", {
          teamId: req.teamId,
        });
      }

      const { startUtc, endUtc } = jstDayRangeUtc(dateJst);
      const todayGames = await this.scheduledGameRepository.findByDate(
        startUtc,
        endUtc
      );
      const todayGame =
        todayGames.find(
          (g) => g.homeTeam.id() === teamId || g.awayTeam.id() === teamId
        ) ?? null;

      const batchCompletedAt =
        (await this.batchStatusRepository.findLatestCompletedAtUtc()) ??
        new Date();

      // 今日のゲームがない場合は下記は週間予報を取得
      const weekly = await this.buildWeekly(dateJst, teamId);

      if (!todayGame) {
        return {
          batchCompletedAtUtc: batchCompletedAt.toISOString(),
          dateJst,
          todayGame: null,
          hourlyWeathers: [],
          weekly,
        };
      }

      const baseUtc = floorToJstHourUtc(todayGame.date);
      const fromUtc = addHours(baseUtc, -3);
      const toUtc = addHours(baseUtc, 3);

      const isKnown = todayGame.ballPark.id() !== 0;
      const isOpenAir = todayGame.ballPark.isOpenAir();

      const hourly = isKnown
        ? await this.ballParkHourlyWeatherForecastRepository.findByDateAndBallPark(
            fromUtc,
            toUtc,
            todayGame.ballPark.id()
          )
        : [];

      const hourlyMap = new Map(hourly.map((h) => [toHourKeyUtc(h.date), h]));

      const hourlyWeathers = Array.from({ length: 6 }, (_, i) => {
        const t = addHours(baseUtc, i - 3);
        const hit = hourlyMap.get(toHourKeyUtc(t));
        return {
          timeUtc: t.toISOString(),
          weather: hit
            ? {
                text: hit.weatherPattern.labelJa(),
                wmoCode: hit.weatherPattern.code(),
                temperatureC: hit.temperature.toNumber(),
                precipProbPct: Math.max(
                  0,
                  Math.round(hit.precipitationProbability.toPercent())
                ),
                precipMm: Math.max(
                  0,
                  Math.round(hit.rainFall.toNumber() * 10) / 10
                ),
              }
            : null,
        };
      });

      const weatherAtGameTime = hourlyMap.get(toHourKeyUtc(baseUtc)) ?? null;
      const weatherAtGameTimeReason: "UNKNOWN_BALLPARK" | "PENDING" | null =
        !isKnown ? "UNKNOWN_BALLPARK" : weatherAtGameTime ? null : "PENDING";

      const predictionMap =
        isKnown && isOpenAir
          ? await this.cancellationPredictionRepository.findLatestByGameIds([
              todayGame.id.toString(),
            ])
          : new Map();
      const prediction = predictionMap.get(todayGame.id.toString());

      const cancelProbReason: "UNKNOWN_BALLPARK" | "PENDING" | "INDOOR" | null =
        !isKnown
          ? "UNKNOWN_BALLPARK"
          : !isOpenAir
          ? "INDOOR"
          : prediction
          ? null
          : "PENDING";

      const home = {
        teamId: todayGame.homeTeam.id(),
        name: BaseballTeam.from(todayGame.homeTeam.id()).labelJa(),
      };
      const away = {
        teamId: todayGame.awayTeam.id(),
        name: BaseballTeam.from(todayGame.awayTeam.id()).labelJa(),
      };

      const todayGameDto = {
        gameId: todayGame.id.toString(),
        startAtUtc: todayGame.date.toISOString(),
        ballpark: todayGame.ballPark.name(),
        status: this.mapStatus(todayGame.status().value),
        home,
        away,
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

      return {
        batchCompletedAtUtc: batchCompletedAt.toISOString(),
        dateJst,
        todayGame: todayGameDto,
        hourlyWeathers,
        weekly,
      };
    } catch (err) {
      if (err instanceof DomainError || err instanceof ValidationError) {
        throw err;
      }
      throw new DomainError("ダッシュボード取得に失敗しました", {
        cause: err,
      });
    }
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

  private async buildWeekly(dateJst: string, teamId: string) {
    const dates = Array.from({ length: 7 }, (_, i) => addDaysJst(dateJst, i));

    const weeklyGames = await this.scheduledGameRepository.findByDate(
      jstDayRangeUtc(dates[0]).startUtc,
      jstDayRangeUtc(dates[6]).endUtc
    );
    const weeklyTargetGames = weeklyGames.filter((g) => {
      const isHome = g.homeTeam.id() === teamId;
      const isAway = g.awayTeam.id() === teamId;
      return isHome || isAway;
    });

    return Promise.all(
      dates.map(async (d) => {
        const { startUtc, endUtc } = jstDayRangeUtc(d);
        const game = weeklyTargetGames.find((g) => {
          const t = g.date.getTime();
          return startUtc.getTime() <= t && t <= endUtc.getTime();
        });
        if (!game) {
          return {
            dateJst: d,
            weather: null,
            highC: null,
            lowC: null,
            game: null,
          };
        }

        const weathers =
          (await this.ballParkDailyWeatherForecastRepository.findByDateAndBallPark(
            startUtc,
            endUtc,
            game.ballPark.id()
          )) ?? null;
        const weather = weathers[0] ?? null;

        return {
          dateJst: d,
          weather: weather
            ? {
                text: weather.weatherPattern.labelJa(),
                wmoCode: weather.weatherPattern.code(),
                temperatureC:
                  (weather.temperatureMax.toNumber() +
                    weather.temperatureMin.toNumber()) /
                  2,
                precipProbPct: weather.precipitationProbability.toPercent(),
                precipMm: weather.rainFall.toNumber(),
              }
            : null,
          highC: weather ? weather.temperatureMax.toNumber() : null,
          lowC: weather ? weather.temperatureMin.toNumber() : null,
          game: {
            gameId: game.id.toString(),
            startAtUtc: game.date.toISOString(),
            ballpark: game.ballPark.name(),
            home: {
              teamId: game.homeTeam.id(),
              name: BaseballTeam.from(game.homeTeam.id()).labelJa(),
            },
            away: {
              teamId: game.awayTeam.id(),
              name: BaseballTeam.from(game.awayTeam.id()).labelJa(),
            },
          },
        };
      })
    );
  }
}
