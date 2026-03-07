import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";

export const GameStatusDictionary: Record<string, GameStatusType> = {
  見どころ: GameStatusType.SCHEDULED,
  スタメン: GameStatusType.SCHEDULED,
  試合前: GameStatusType.SCHEDULED,
  試合中: GameStatusType.IN_PROGRESS,
  試合終了: GameStatusType.COMPLETED,
  試合中止: GameStatusType.CANCELLED,
};
