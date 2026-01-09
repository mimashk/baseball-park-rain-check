import { PastGameRecordDto } from "../../../application/training/dtos/PastGameRecordDto";
import { PastGameRecordFetcher } from "../../../application/training/interfaces/PastGameRecordFetcher";
import { HanshinPastGameFormatter } from "./HanshinPastGameFormatter";
import { HanshinPastGameScraper } from "./HanshinPastGameScraper";

export class HanshinPastGameFetcher implements PastGameRecordFetcher {
  constructor(
    private readonly scraper: HanshinPastGameScraper,
    private readonly formatter: HanshinPastGameFormatter
  ) {}

  async fetchPastGameRecords(
    from: Date,
    to: Date
  ): Promise<PastGameRecordDto[]> {
    const years = this.rangeYears(from, to);
    const yearly = await Promise.all(
      years.map(({ year }) => this.scraper.fetchYearlyGames({ year }))
    );

    return yearly.flat().map((raw) => this.formatter.toDto(raw));
  }

  private rangeYears(from: Date, to: Date) {
    const res: { year: number }[] = [];
    for (let year = from.getFullYear(); year <= to.getFullYear(); year++) {
      res.push({ year });
    }
    return res;
  }
}
