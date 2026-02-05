import { GameStatusMapper } from "../../../application/scheduledGame/interfaces/GameStatusMapper";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { GameStatusDictionary } from "./GameStatusDictionary";

export class GameStatusMapperImpl implements GameStatusMapper {
  constructor(
    private readonly dictionary: Record<string, string> = GameStatusDictionary
  ) {}

  toDomainStatus(externalStatus: string): GameStatusType | undefined {
    const status = this.dictionary[externalStatus];
    if (!status) return undefined;
    return status as GameStatusType;
  }
}
