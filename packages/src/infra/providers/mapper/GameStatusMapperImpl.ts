import { GameStatusMapper } from "../../../application/scheduledGame/interfaces/GameStatusMapper";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { GameStatusDictionary } from "./GameStatusDictionary";

export class GameStatusMapperImpl implements GameStatusMapper {
  constructor(
    private readonly dictionary: Record<
      string,
      GameStatusType
    > = GameStatusDictionary
  ) {}

  toDomainStatus(externalStatus: string): GameStatusType | undefined {
    const normalized = externalStatus.trim();

    const exact = this.dictionary[normalized];
    if (exact) return exact as GameStatusType;

    // 例: 1回表, 9回裏
    if (/^\d+回[表裏]$/.test(normalized)) {
      return GameStatusType.IN_PROGRESS;
    }

    // 例: 延長10回表, 延長12回裏
    if (/^延長\d+回[表裏]$/.test(normalized)) {
      return GameStatusType.IN_PROGRESS;
    }

    return undefined;
  }
}
