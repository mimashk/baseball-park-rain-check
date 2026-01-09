import { PastGameRecordDto } from "../dtos/PastGameRecordDto";
import { PastGameRecordFetcher } from "../interfaces/PastGameRecordFetcher";

export class FetchPastGamesService {
  constructor(private readonly fetcher: PastGameRecordFetcher) {}

  async exec(from: Date, to: Date): Promise<PastGameRecordDto[]> {
    const games = await this.fetcher.fetchPastGameRecords(from, to);
    const inRange = games.filter((g) => {
      const t = g.date.getTime();
      return t >= from.getTime() && t <= to.getTime();
    });
    const deduped = this.dedupeByKey(
      inRange,
      (g) => `${g.date.toISOString()}::${g.homeTeam}::${g.awayTeam}`
    );
    return deduped.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private dedupeByKey<T>(items: T[], keyFn: (item: T) => string) {
    const map = new Map<string, T>();
    for (const item of items) map.set(keyFn(item), item);
    return [...map.values()];
  }
}
