import { ScheduledGame } from "../../../domain/scheduledGame/entities/ScheduledGame";
import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { TransactionExecutor } from "../../shared/interfaces/TransactionExecutor";
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

export class RefreshScheduledGameAndDailyWeatherForecastUsecase {
  constructor(
    private readonly scheduledGameFetcher: ScheduledGameFetcher,
    private readonly dailyWeatherForecastProvider: DailyWeatherForecastProvider,
    private readonly scheduledGameRepository: ScheduledGameRepository,
    private readonly dailyWeatherForecastRepository: BallParkDailyWeatherForecastRepository,
    private readonly txExecutor: TransactionExecutor
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
        // [TODO]甲子園だけにするかどうかは考えよう
        // if (
        //   domainProps.ballPark !==
        //   BallParkCatalog.HANSHIN_KOSHIEN_STADIUM.labelJa
        // ) {
        //   return null;
        // }
        return ScheduledGame.create(domainProps);
      });
      const filteredScheduledGames = scheduledGames.filter((g) => g !== null);
      await this.txExecutor.run(async (trx) => {
        await this.scheduledGameRepository
          .withTransaction(trx)
          .upsertMany(filteredScheduledGames);
      });

      const forecastTargets = filteredScheduledGames.filter((game) =>
        Boolean(BallParkWeatherPointCatalog[game.ballPark.id()])
      );

      const points: DailyForecastPoint[] = forecastTargets.map((game) => {
        return {
          date: game.date,
          latitude: BallParkWeatherPoint.create(game.ballPark.id()).latitude(),
          longitude: BallParkWeatherPoint.create(
            game.ballPark.id()
          ).longitude(),
        };
      });
      try {
        const dailyWeatherForecastDtos =
          await this.dailyWeatherForecastProvider.fetchDailyForecasts(points);
        const dailyWeatherOverviews = dailyWeatherForecastDtos
          .map((dailyWeatherForecastDto, index) =>
            mapDailyWeatherForecastDtoToProps(
              dailyWeatherForecastDto,
              forecastTargets[index].ballPark.id()
            )
          )
          .map(BallParkDailyWeatherForecast.create);
        await this.txExecutor.run(async (trx) => {
          await this.dailyWeatherForecastRepository
            .withTransaction(trx)
            .updateMany(dailyWeatherOverviews);
        });
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
        }試合を作成し、${forecastTargets.length}試合の天気予報を取得しました`,
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
}
