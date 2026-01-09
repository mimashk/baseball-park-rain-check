import { TeamNameMapper } from "../../../application/shared/interfaces/TeamNameMapper";
import { BaseballTeamType } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { BaseballTeamDictionary } from "./BaseballTeamDictionary";

export class TeamNameMapperImpl implements TeamNameMapper {
  constructor(
    private readonly dictionary: Record<string, string> = BaseballTeamDictionary
  ) {}

  toDomainTeam(externalName: string): BaseballTeamType | undefined {
    const team = this.dictionary[externalName];
    if (!team) return undefined;
    return team as BaseballTeamType;
  }
}
