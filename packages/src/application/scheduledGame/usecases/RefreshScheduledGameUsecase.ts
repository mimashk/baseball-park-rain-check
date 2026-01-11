import { ScheduledGame } from "../../../domain/scheduledGame/entities/ScheduledGame";
import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { BallParkCatalog } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { TransactionExecutor } from "../../shared/interfaces/TransactionExecutor";
import { ensureValidDateRange } from "../../shared/utils/ensureValidDateRange";
import { RefreshScheduledGameRequest } from "../dtos/RefreshScheduledGameRequest";
import { RefreshScheduledGameResponse } from "../dtos/RefreshScheduledGameResponse";
import { ScheduledGameFetcher } from "../interfaces/ScheduledGameFetcher";
import { mapScheduledGameDtoToCreateProps } from "../mapper/mapScheduledGameDtoToCreateProps";

export class RefreshScheduledGameUsecase {
  constructor(
    private readonly fetcher: ScheduledGameFetcher,
    private readonly scheduledGameRepository: ScheduledGameRepository,
    private readonly txExecutor: TransactionExecutor
  ) {}

  async execute(
    request: RefreshScheduledGameRequest
  ): Promise<RefreshScheduledGameResponse> {
    const { from: normalizedFrom, to: normalizedTo } = ensureValidDateRange(
      "from",
      "to",
      request.from,
      request.to
    );
    try {
      const rawScheduledGames = await this.fetcher.fetchScheduledGames(
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
      return {
        gameIds: filteredScheduledGames.map((scheduledGame) =>
          scheduledGame.id.toString()
        ),
        message: `${normalizedFrom.toISOString()}から${normalizedTo.toISOString()}間の${
          scheduledGames.length
        }試合を作成しました`,
      };
    } catch (err: unknown) {
      // ドメイン系はそのまま再throw
      if (err instanceof DomainError || err instanceof ValidationError) {
        throw err;
      }
      // 外部I/O（取得/永続化）例外を正規化
      throw new DomainError("試合情報の作成に失敗しました", {
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
