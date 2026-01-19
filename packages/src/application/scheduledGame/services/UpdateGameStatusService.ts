import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { GameId } from "../../../domain/scheduledGame/valueObjects/GameId";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { DomainError } from "../../../shared/errors/DomainError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { GameStatusFetcher } from "../interfaces/GameStatusFetcher";

export class UpdateGameStatusService {
  constructor(
    private readonly gameRepository: ScheduledGameRepository,
    private readonly fetcher: GameStatusFetcher
  ) {}

  async execute(gameId: GameId): Promise<GameStatusType> {
    try {
      const game = await this.gameRepository.findById(gameId);
      if (!game) {
        throw new NotFoundError("試合が見つかりません", { gameId });
      }

      // 外部から最新ステータスを取得
      const latest = await this.fetcher.fetchStatus({
        date: game.date,
        homeTeamId: game.homeTeam.id(),
        awayTeamId: game.awayTeam.id(),
      });

      if (!Object.values(GameStatusType).includes(latest.status)) {
        throw new ValidationError("不正なステータスを受信しました", {
          status: latest.status,
        });
      }

      // 変化がなければそのまま返す（無駄なwriteを避ける）
      if (latest.status === game.status().value) return game.status().value;

      if (latest.status === GameStatusType.COMPLETED) {
        game.complete();
      } else if (latest.status === GameStatusType.CANCELLED) {
        game.cancel();
      } else if (latest.status === GameStatusType.IN_PROGRESS) {
        game.start(new Date());
      }
      await this.gameRepository.updateStatus(gameId, latest.status);

      return latest.status;
    } catch (err: unknown) {
      if (
        err instanceof DomainError ||
        err instanceof ValidationError ||
        err instanceof NotFoundError
      ) {
        throw err;
      }
      throw new DomainError("試合ステータスの更新に失敗しました", {
        cause: err,
        gameId,
      });
    }
  }
}
