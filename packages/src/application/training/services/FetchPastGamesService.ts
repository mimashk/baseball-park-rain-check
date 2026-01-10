import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDateRange } from "../../shared/utils/ensureValidDateRange";
import { PastGameRecordDto } from "../dtos/PastGameRecordDto";
import { PastGameRecordFetcher } from "../interfaces/PastGameRecordFetcher";

export class FetchPastGamesService {
  constructor(private readonly fetcher: PastGameRecordFetcher) {}

  async exec(from: Date, to: Date): Promise<PastGameRecordDto[]> {
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
      const inRange = games.filter((g) => {
        const t = g.date.getTime();
        return t >= normalizedFrom.getTime() && t <= normalizedTo.getTime();
      });
      const deduped = this.dedupeByKey(
        inRange,
        (g) => `${g.date.toISOString()}::${g.homeTeam}::${g.awayTeam}`
      );
      return deduped.sort((a, b) => a.date.getTime() - b.date.getTime());
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
