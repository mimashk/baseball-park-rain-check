import { ScheduledGameDto } from "../../../application/refresher/dtos/ScheduledGameDto";
import { ScheduledGameFetcher } from "../../../application/refresher/interfaces/ScheduledGameFetcher";
import { ScheduledGameFormatter } from "./ScheduledGameFormatter";
import { ScheduledGameScraper } from "./ScheduledGameScraper";

export class ScheduledGameFetcherImpl implements ScheduledGameFetcher {
  constructor(
    private readonly scraper: ScheduledGameScraper,
    private readonly formatter: ScheduledGameFormatter
  ) {}

  async fetchScheduledGames(from: Date, to: Date): Promise<ScheduledGameDto[]> {
    const days = this.rangeDays(from, to); // 外部が日単位しか取れないなどの制約対応
    const scheduledGames = await Promise.all(
      days.map(({ year, month, day }) =>
        this.scraper.fetchScheduledGames({ year, month, day })
      )
    );
    return scheduledGames
      .flat()
      .map((raw) => this.formatter.toDto(raw))
      .filter((dto): dto is ScheduledGameDto => dto !== null);
  }

  private rangeDays(from: Date, to: Date) {
    const res: { year: number; month: number; day: number }[] = [];
    const cursor = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    );
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    while (cursor <= end) {
      res.push({
        year: cursor.getFullYear(),
        month: cursor.getMonth() + 1,
        day: cursor.getDate(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return res;
  }
}
