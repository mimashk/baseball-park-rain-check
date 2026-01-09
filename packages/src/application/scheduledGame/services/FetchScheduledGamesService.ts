import { ScheduledGameDto } from "../dtos/ScheduledGameDto";
import { ScheduledGameFetcher } from "../interfaces/ScheduledGameFetcher";

export class FetchScheduledGamesService {
  constructor(private readonly fetcher: ScheduledGameFetcher) {}

  async exec(from: Date, to: Date): Promise<ScheduledGameDto[]> {
    const games = await this.fetcher.fetchScheduledGames(from, to);
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
