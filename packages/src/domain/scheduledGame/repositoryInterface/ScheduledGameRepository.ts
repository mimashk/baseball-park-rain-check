import { TransactionContext } from "../../shared/interfaces/TransactionContext";
import { ScheduledGame } from "../entities/ScheduledGame";
import { GameId } from "../valueObjects/GameId";
import { GameStatusType } from "../valueObjects/GameStatus";

export interface ScheduledGameRepository {
  upsertMany(scheduledGames: ScheduledGame[]): Promise<void>;
  replaceByDateRange(
    from: Date,
    to: Date,
    scheduledGames: ScheduledGame[]
  ): Promise<void>;
  purgeBefore(cutoff: Date): Promise<void>;
  updateStatus(gameId: GameId, status: GameStatusType): Promise<void>;
  findByDate(from: Date, to: Date): Promise<ScheduledGame[]>;
  findAtDate(date: Date): Promise<ScheduledGame[]>;
  findById(id: GameId): Promise<ScheduledGame | null>;
}
