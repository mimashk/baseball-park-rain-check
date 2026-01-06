import { ScheduledGame } from "../entities/ScheduledGame";
import { GameId } from "../valueObjects/GameId";
import { GameStatusType } from "../valueObjects/GameStatus";

export interface ScheduledGameRepository {
  upsert(scheduledGame: ScheduledGame): Promise<void>;
  updateStatus(gameId: GameId, status: GameStatusType): Promise<void>;
  findByDate(from: Date, to: Date): Promise<ScheduledGame[]>;
  findById(id: GameId): Promise<ScheduledGame | null>;
}
