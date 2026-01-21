import { PastGameRecordDto } from "../../../application/training/dtos/PastGameRecordDto";
import { PastGameRecordFetcher } from "../../../application/training/interfaces/PastGameRecordFetcher";
import { PastGameFormatter } from "./PastGameFormatter";
import {
  PastGameInfo,
  PastGameScraper,
  TEAM_CODE_LIST,
  TeamCode,
} from "./PastGameScraper";

export class PastGameRecordFetcherImpl implements PastGameRecordFetcher {
  constructor(
    private readonly scraper: PastGameScraper,
    private readonly formatter: PastGameFormatter
  ) {}

  async fetchPastGameRecords(
    from: Date,
    to: Date
  ): Promise<PastGameRecordDto[]> {
    const years = this.rangeYears(from, to);
    const yearly: PastGameInfo[][] = [];
    for (const { year } of years) {
      for (const team of TEAM_CODE_LIST) {
        const teamCode = this.resolveTeamCode(team, year);
        const games = await this.scraper.fetchYearlyGames({
          year,
          teamCode,
          league: team.league,
          teamLabel: team.label,
        });
        yearly.push(games);
      }
    }

    return yearly
      .flat()
      .map((raw) => this.formatter.toDto(raw))
      .filter((dto): dto is PastGameRecordDto => dto !== null);
  }

  private rangeYears(from: Date, to: Date) {
    const res: { year: number }[] = [];
    for (let year = from.getFullYear(); year <= to.getFullYear(); year++) {
      res.push({ year });
    }
    return res;
  }

  // オリックスのチームコードが2018年前後で変わるので、そのためだけのロジック
  private resolveTeamCode(team: TeamCode, year: number): string {
    if (team.legacyCode && team.legacyToYear && year <= team.legacyToYear) {
      return team.legacyCode;
    }
    return team.key;
  }
}
