import { ScheduledGame } from "../../../domain/scheduledGame/entities/ScheduledGame";
import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDateRange } from "../../shared/utils/ensureValidDateRange";
import { RefreshScheduledGameAndDailyWeatherForecastRequest } from "../dtos/RefreshScheduledGameAndDailyWeatherForecastRequest";
import { RefreshScheduledGameAndDailyWeatherForecastResponse } from "../dtos/RefreshScheduledGameAndDailyWeatherForecastResponse";
import { ScheduledGameFetcher } from "../interfaces/ScheduledGameFetcher";
import { mapScheduledGameDtoToCreateProps } from "../mapper/mapScheduledGameDtoToCreateProps";
import {
  BallParkWeatherPoint,
  BallParkWeatherPointCatalog,
} from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import {
  DailyForecastPoint,
  DailyWeatherForecastProvider,
} from "../interfaces/DailyWeatherForecastProvider";
import { mapDailyWeatherForecastDtoToProps } from "../mapper/mapDailyWeatherForecastDtoToProps";
import { BallParkDailyWeatherForecast } from "../../../domain/weatherForecast/valueObjects/BallParkDailyWeatherForecast";
import { BallParkDailyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkDailyWeatherForecastRepository";
import { BallParkId } from "@domain/scheduledGame/valueObjects/BallPark";

export class RefreshScheduledGameAndDailyWeatherForecastUsecase {
  constructor(
    private readonly scheduledGameFetcher: ScheduledGameFetcher,
    private readonly dailyWeatherForecastProvider: DailyWeatherForecastProvider,
    private readonly scheduledGameRepository: ScheduledGameRepository,
    private readonly dailyWeatherForecastRepository: BallParkDailyWeatherForecastRepository
  ) {}

  async execute(
    request: RefreshScheduledGameAndDailyWeatherForecastRequest
  ): Promise<RefreshScheduledGameAndDailyWeatherForecastResponse> {
    const { from: normalizedFrom, to: normalizedTo } = ensureValidDateRange(
      "from",
      "to",
      request.from,
      request.to
    );
    try {
      const rawScheduledGames =
        await this.scheduledGameFetcher.fetchScheduledGames(
          normalizedFrom,
          normalizedTo
        );
      // 0件ならメッセージだけ返して終了
      if (rawScheduledGames.length === 0) {
        console.log(
          `${normalizedFrom.toISOString()}から${normalizedTo.toISOString()}間は試合がありませんでした`
        );
        return {
          gameIds: [],
          message: `${normalizedFrom.toISOString()}から${normalizedTo.toISOString()}間は試合がありませんでした`,
        };
      }
      const inRangScheduledGames = rawScheduledGames.filter((g) => {
        const t = g.date.getTime();
        return t >= normalizedFrom.getTime() && t <= normalizedTo.getTime();
      });
      const dedupedScheduledGames = this.dedupeByKey(
        inRangScheduledGames,
        (g) => `${g.date.toISOString()}::${g.homeTeam}::${g.awayTeam}`
      );
      const sortedScheduledGames = dedupedScheduledGames.sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      const scheduledGames = sortedScheduledGames.map((rawScheduledGame) => {
        const domainProps = mapScheduledGameDtoToCreateProps(rawScheduledGame);
        return ScheduledGame.create(domainProps);
      });
      const filteredScheduledGames = scheduledGames.filter((g) => g !== null);
      // 容量対策: 今日以降は残し、それ以前を削除
      const keepFrom = new Date(normalizedFrom.getTime() - 24 * 60 * 60 * 1000);
      await this.scheduledGameRepository.purgeBefore(keepFrom);
      await this.scheduledGameRepository.replaceByDateRange(
        normalizedFrom,
        normalizedTo,
        filteredScheduledGames
      );

      const forecastTargets = filteredScheduledGames.filter((game) =>
        Boolean(BallParkWeatherPointCatalog[game.ballPark.id()])
      );
      // key単位でグループ化（同じ日付JST・同じ緯度経度を1回だけ取得）
      const groupedByForecastPoint = new Map<
        string,
        { point: DailyForecastPoint; ballParkId: BallParkId }
      >();

      for (const game of forecastTargets) {
        const ballParkId = game.ballPark.id();
        const weatherPoint = BallParkWeatherPoint.create(ballParkId);

        const point: DailyForecastPoint = {
          date: game.date,
          latitude: weatherPoint.latitude(),
          longitude: weatherPoint.longitude(),
        };

        const key = `${this.toJstDateKey(game.date)}::${ballParkId}`;
        if (!groupedByForecastPoint.has(key)) {
          groupedByForecastPoint.set(key, { point, ballParkId });
        }
      }

      const groupedTargets = [...groupedByForecastPoint.values()];
      const points = groupedTargets.map((g) => g.point);
      try {
        const dailyWeatherForecastDtos =
          await this.dailyWeatherForecastProvider.fetchDailyForecasts(points);

        if (dailyWeatherForecastDtos.length !== groupedTargets.length) {
          throw new DomainError("天気予報の件数と対象件数が一致しません", {
            dtoCount: dailyWeatherForecastDtos.length,
            targetCount: groupedTargets.length,
          });
        }

        const dailyWeatherOverviews = dailyWeatherForecastDtos
          .map((dailyWeatherForecastDto, index) =>
            mapDailyWeatherForecastDtoToProps(
              dailyWeatherForecastDto,
              groupedTargets[index].ballParkId
            )
          )
          .map(BallParkDailyWeatherForecast.create);

        await this.dailyWeatherForecastRepository.updateMany(
          dailyWeatherOverviews
        );
      } catch (err: unknown) {
        // ドメイン系はそのまま再throw
        if (err instanceof DomainError || err instanceof ValidationError) {
          throw err;
        }
        throw new DomainError("天気予報の取得に失敗しました", {
          cause: err,
          points: points,
        });
      }
      return {
        gameIds: filteredScheduledGames.map((scheduledGame) =>
          scheduledGame.id.toString()
        ),
        message: `${normalizedFrom.toISOString()}から${normalizedTo.toISOString()}間の${
          scheduledGames.length
        }試合を作成し、${
          forecastTargets.length
        }試合の天気予報を取得しました。球場ごとに${
          groupedTargets.length
        }件の天気予報を取得しました。`,
      };
    } catch (err: unknown) {
      // ドメイン系はそのまま再throw
      if (err instanceof DomainError || err instanceof ValidationError) {
        throw err;
      }
      // 外部I/O（取得/永続化）例外を正規化
      throw new DomainError("試合情報と天気予報の作成に失敗しました", {
        cause: err,
        from: normalizedFrom,
        to: normalizedTo,
      });
    }
  }

  private dedupeByKey<T>(items: T[], keyFn: (item: T) => string) {
    const map = new Map<string, T>();
    for (const item of items) map.set(keyFn(item), item);
    return [...map.values()];
  }

  private jstDateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  private toJstDateKey(date: Date): string {
    const parts = this.jstDateFormatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (!year || !month || !day) throw new Error("Failed to format JST date");
    return `${year}-${month}-${day}`;
  }
}
