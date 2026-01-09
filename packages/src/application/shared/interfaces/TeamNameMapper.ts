import { BaseballTeamType } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";

export interface TeamNameMapper {
  toDomainTeam(externalName: string): BaseballTeamType | undefined; // 未知表記は undefined で返すなど
}
