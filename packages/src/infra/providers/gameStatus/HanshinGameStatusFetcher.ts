import { GameStatusDto } from "../../../application/scheduledGame/dtos/GameStatusDto";
import { GameStatusFetcher } from "../../../application/scheduledGame/interfaces/GameStatusFetcher";
import { TeamNameMapper } from "../../../application/shared/interfaces/TeamNameMapper";
import { BaseballTeamType } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { GameStatusFormatter } from "./GameStatusFormatter";
import { GameStatusScraper } from "./GameStatusScraper";

export class HanshinGameStatusFetcher implements GameStatusFetcher {
  constructor(
    private readonly scraper: GameStatusScraper,
    private readonly formatter: GameStatusFormatter
  ) {}
  async fetchStatus(input: {
    date: Date;
    homeTeamName: BaseballTeamType;
    awayTeamName: BaseballTeamType;
  }): Promise<GameStatusDto> {
    const gameStatusInfoList = await this.scraper.fetchStatus(input);
    const formatted = gameStatusInfoList.map((gameStatusInfo) =>
      this.formatter.toDto(gameStatusInfo)
    );
    const filtered = formatted.filter((g) => {
      return (
        g.homeTeam === input.homeTeamName && g.awayTeam === input.awayTeamName
      );
    });
    if (filtered.length > 1) {
      throw new Error("複数の試合情報が見つかりました");
    }
    return filtered[0];
  }
}
