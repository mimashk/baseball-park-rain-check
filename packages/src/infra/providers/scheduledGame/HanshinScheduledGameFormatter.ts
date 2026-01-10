import { ScheduledGameDto } from "../../../application/scheduledGame/dtos/ScheduledGameDto";
import { TeamNameMapper } from "../../../application/shared/interfaces/TeamNameMapper";
import { BaseballTeamType } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";
import { ScheduledGameInfo } from "./HanshinScheduledGameScraper";

export class HanshinScheduledGameFormatter {
  constructor(private readonly teamNameMapper: TeamNameMapper) {}
  toDto(gameInfo: ScheduledGameInfo): ScheduledGameDto {
    const homeTeam = this.requireTeam(gameInfo.homeTeam);
    const awayTeam = this.requireTeam(gameInfo.awayTeam);
    const date = this.buildDate(
      gameInfo.year,
      gameInfo.month,
      gameInfo.day,
      gameInfo.startTime
    );
    return {
      date,
      category: gameInfo.category,
      homeTeam,
      awayTeam,
      ballPark: gameInfo.ballPark,
    };
  }

  private buildDate(
    year: number,
    month: number,
    day: number,
    startTime: string
  ): Date {
    return new Date(
      year,
      month - 1,
      day,
      parseInt(startTime.split(":")[0]),
      parseInt(startTime.split(":")[1])
    );
  }

  private requireTeam(external: string): BaseballTeamType {
    const team = this.teamNameMapper.toDomainTeam(external);
    if (!team) {
      throw new InfrastructureError("mapping", `未知のチーム名: ${external}`);
    }
    return team;
  }
}
