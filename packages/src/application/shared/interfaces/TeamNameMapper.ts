import { BaseballTeamType } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";

export interface TeamNameMapper {
  toDomainTeam(externalName: string): BaseballTeamType | undefined;
}
