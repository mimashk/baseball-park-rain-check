import { GameStatusDto } from "../../../application/scheduledGame/dtos/GameStatusDto";
import { GameStatusFetcher } from "../../../application/scheduledGame/interfaces/GameStatusFetcher";
import { TeamNameMapper } from "../../../application/shared/interfaces/TeamNameMapper";
import { BaseballTeamType } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";
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
      throw new InfrastructureError(
        "mapping",
        "複数の試合情報が見つかりました"
      );
    }
    if (!filtered.length) {
      throw new InfrastructureError(
        "not_found",
        "試合情報が見つかりませんでした"
      );
    }
    return filtered[0];
  }
}
