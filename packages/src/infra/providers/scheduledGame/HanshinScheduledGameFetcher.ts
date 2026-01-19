import { ScheduledGameDto } from "../../../application/refresher/dtos/ScheduledGameDto";
import { ScheduledGameFetcher } from "../../../application/refresher/interfaces/ScheduledGameFetcher";
import { HanshinScheduledGameFormatter } from "./HanshinScheduledGameFormatter";
import { HanshinScheduledGameScraper } from "./HanshinScheduledGameScraper";

export class HanshinScheduledGameFetcher implements ScheduledGameFetcher {
  constructor(
    private readonly scraper: HanshinScheduledGameScraper,
    private readonly formatter: HanshinScheduledGameFormatter
  ) {}

  async fetchScheduledGames(from: Date, to: Date): Promise<ScheduledGameDto[]> {
    const months = this.rangeMonths(from, to); // 外部が月単位しか取れないなどの制約対応
    const monthly = await Promise.all(
      months.map(({ year, month }) =>
        this.scraper.fetchMonthlyGames({ year, month })
      )
    );
    return monthly
      .flat()
      .map((raw) => this.formatter.toDto(raw))
      .filter((dto): dto is ScheduledGameDto => dto !== null);
  }

  private rangeMonths(from: Date, to: Date) {
    const res: { year: number; month: number }[] = [];
    const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 1);
    while (cursor <= end) {
      res.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return res;
  }
}
