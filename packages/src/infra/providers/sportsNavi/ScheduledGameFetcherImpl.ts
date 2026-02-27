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

  private readonly jstFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  private toJstDateKey(date: Date): string {
    const parts = this.jstFormatter.formatToParts(date);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    if (!y || !m || !d) throw new Error("Failed to format JST date");
    return `${y}-${m}-${d}`; // YYYY-MM-DD
  }

  private addOneDayKey(key: string): string {
    const [y, m, d] = key.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + 1);
    return dt.toISOString().slice(0, 10);
  }

  private rangeDays(from: Date, to: Date) {
    const res: { year: number; month: number; day: number }[] = [];
    let current = this.toJstDateKey(from);
    const end = this.toJstDateKey(to);

    while (current <= end) {
      const [year, month, day] = current.split("-").map(Number);
      res.push({ year, month, day });
      current = this.addOneDayKey(current);
    }
    return res;
  }
}
