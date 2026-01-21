import {
  BallParkCatalog,
  BallParkId,
} from "../../../domain/scheduledGame/valueObjects/BallPark";
import { PastGameRecord } from "../../../domain/training/valueObjects/PastGameRecord";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDateRange } from "../../shared/utils/ensureValidDateRange";
import { PastGameRecordFetcher } from "../interfaces/PastGameRecordFetcher";
import { mapPastGameDtoToCreateProps } from "../mapper/mapPastGameDtoToCreateProps";

export class FetchPastGamesService {
  constructor(private readonly fetcher: PastGameRecordFetcher) {}

  async execute(from: Date, to: Date): Promise<PastGameRecord[]> {
    const { from: normalizedFrom, to: normalizedTo } = ensureValidDateRange(
      "from",
      "to",
      from,
      to
    );
    try {
      const games = await this.fetcher.fetchPastGameRecords(
        normalizedFrom,
        normalizedTo
      );
      const inRangePastGames = games.filter((g) => {
        const t = g.date.getTime();
        return t >= normalizedFrom.getTime() && t <= normalizedTo.getTime();
      });
      const dedupedPastGames = this.dedupeByKey(
        inRangePastGames,
        (g) =>
          `${g.date.toISOString()}::${g.homeTeam}::${g.awayTeam}::${g.ballPark}`
      );
      const sortedPastGames = dedupedPastGames.sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      const pastGames = sortedPastGames
        .map((rawPastGame) => {
          try {
            const domainProps = mapPastGameDtoToCreateProps(rawPastGame);
            return PastGameRecord.create(domainProps); // ドメイン例外は上へ
          } catch (err: unknown) {
            throw new ValidationError("過去試合データの変換に失敗しました", {
              game: rawPastGame,
              cause: err,
            });
          }
        })
        .filter((g): g is PastGameRecord => g !== null);
      return pastGames;
    } catch (err: unknown) {
      if (err instanceof ValidationError || err instanceof DomainError)
        throw err;
      throw new DomainError("過去試合の取得に失敗しました", {
        cause: err,
        from,
        to,
      });
    }
  }

  private dedupeByKey<T>(items: T[], keyFn: (item: T) => string) {
    const map = new Map<string, T>();
    for (const item of items) map.set(keyFn(item), item);
    return [...map.values()];
  }
}
