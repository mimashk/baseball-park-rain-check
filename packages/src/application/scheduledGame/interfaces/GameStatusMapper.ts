import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";

export interface GameStatusMapper {
  toDomainStatus(externalStatus: string): GameStatusType | undefined; // 未知表記は undefined で返すなど
}
