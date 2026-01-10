import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDateRange } from "../../shared/utils/ensureValidDateRange";
import { ScheduledGameDto } from "../dtos/ScheduledGameDto";
import { ScheduledGameFetcher } from "../interfaces/ScheduledGameFetcher";

export class FetchScheduledGamesService {
  constructor(private readonly fetcher: ScheduledGameFetcher) {}

  async exec(from: Date, to: Date): Promise<ScheduledGameDto[]> {
    const { from: normalizedFrom, to: normalizedTo } = ensureValidDateRange(
      "from",
      "to",
      from,
      to
    );
    try {
      const games = await this.fetcher.fetchScheduledGames(
        normalizedFrom,
        normalizedTo
      );
      const inRange = games.filter((g) => {
        const t = g.date.getTime();
        return t >= from.getTime() && t <= to.getTime();
      });
      const deduped = this.dedupeByKey(
        inRange,
        (g) => `${g.date.toISOString()}::${g.homeTeam}::${g.awayTeam}`
      );
      return deduped.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (err: unknown) {
      if (err instanceof ValidationError || err instanceof DomainError)
        throw err;
      throw new DomainError("試合情報の取得に失敗しました", {
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
