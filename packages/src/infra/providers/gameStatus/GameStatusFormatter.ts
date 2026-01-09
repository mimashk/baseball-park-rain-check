import { GameStatusDto } from "../../../application/scheduledGame/dtos/GameStatusDto";
import { GameStatusMapper } from "../../../application/scheduledGame/interfaces/GameStatusMapper";
import { TeamNameMapper } from "../../../application/shared/interfaces/TeamNameMapper";
import { BaseballTeamType } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { GameStatusInfo } from "./GameStatusScraper";

export class GameStatusFormatter {
  constructor(
    private readonly teamNameMapper: TeamNameMapper,
    private readonly gameStatusMapper: GameStatusMapper
  ) {}
  toDto(gameStatusInfo: GameStatusInfo): GameStatusDto {
    const homeTeam = this.requireTeam(gameStatusInfo.homeTeam);
    const awayTeam = this.requireTeam(gameStatusInfo.awayTeam);
    const status = this.requireStatus(gameStatusInfo.status);
    return {
      homeTeam,
      awayTeam,
      status,
    };
  }

  private requireTeam(external: string): BaseballTeamType {
    const team = this.teamNameMapper.toDomainTeam(external);
    if (!team) {
      throw new Error(`未知のチーム名: ${external}`);
    }
    return team;
  }

  private requireStatus(external: string): GameStatusType {
    const status = this.gameStatusMapper.toDomainStatus(external);
    if (!status) {
      throw new Error(`未知のステータス: ${external}`);
    }
    return status;
  }
}
