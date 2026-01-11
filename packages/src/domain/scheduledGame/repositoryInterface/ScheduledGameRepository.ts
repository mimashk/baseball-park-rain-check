import { TransactionContext } from "../../shared/interfaces/TransactionContext";
import { ScheduledGame } from "../entities/ScheduledGame";
import { GameId } from "../valueObjects/GameId";
import { GameStatusType } from "../valueObjects/GameStatus";

export interface ScheduledGameRepository {
  withTransaction(tx: TransactionContext): ScheduledGameRepository;
  upsertMany(scheduledGames: ScheduledGame[]): Promise<void>;
  updateStatus(gameId: GameId, status: GameStatusType): Promise<void>;
  findByDate(from: Date, to: Date): Promise<ScheduledGame[]>;
  findTodayScheduledGames(): Promise<ScheduledGame[]>;
  findById(id: GameId): Promise<ScheduledGame | null>;
}
