import { TeamNameMapper } from "../../../application/shared/interfaces/TeamNameMapper";
import { TeamId } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { BaseballTeamDictionary } from "./BaseballTeamDictionary";

export class TeamNameMapperImpl implements TeamNameMapper {
  private readonly dictionary: Record<string, string>;
  constructor(dictionary: Record<string, string> = BaseballTeamDictionary) {
    this.dictionary = dictionary;
  }

  toDomainTeam(externalName: string): TeamId | undefined {
    const mapped = this.dictionary[externalName];
    // 辞書未登録でも非空ならそのまま返す
    if (mapped) return mapped as TeamId;
    return undefined;
  }
}
