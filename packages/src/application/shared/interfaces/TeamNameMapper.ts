import { TeamId } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";

export interface TeamNameMapper {
  toDomainTeam(externalName: string): TeamId | undefined;
}
