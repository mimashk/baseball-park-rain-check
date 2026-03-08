import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { GameId } from "../../../domain/scheduledGame/valueObjects/GameId";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { DomainError } from "../../../shared/errors/DomainError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDate } from "../../shared/utils/ensureValidDate";
import { RunGameCheckpointRequest } from "../dtos/RunGameCheckpointRequest";
import { RunGameCheckpointResponse } from "../dtos/RunGameCheckpointResponse";
import { CheckpointScheduler } from "../interfaces/CheckpointScheduler";
import { DecideNextIntervalMinutesService } from "../services/DecideNextIntervalMinutesService";
import { UpdateGameStatusService } from "../services/UpdateGameStatusService";

export class RunGameCheckpointUseCase {
  constructor(
    private readonly updateGameStatusService: UpdateGameStatusService,
    private readonly scheduler: CheckpointScheduler,
    private readonly gameRepository: ScheduledGameRepository
  ) {}

  async execute(
    request: RunGameCheckpointRequest
  ): Promise<RunGameCheckpointResponse> {
    try {
      const gameIdStr = request.gameId;
      const gameId = GameId.fromString(gameIdStr);
      const game = await this.gameRepository.findById(gameId);
      if (!game) {
        throw new NotFoundError("試合が見つかりません", { gameId });
      }
      const normalizedNow = ensureValidDate("now", request.now);
      const normalizedStartAt = ensureValidDate("startAt", game.date);

      const status = await this.updateGameStatusService.execute(gameId);

      const nextInterval = DecideNextIntervalMinutesService.execute({
        now: normalizedNow,
        startAt: normalizedStartAt,
        status,
      });

      if (
        status === GameStatusType.COMPLETED ||
        status === GameStatusType.CANCELLED ||
        nextInterval === null
      ) {
        await this.scheduler.deleteCheckpoint(request.jobKey);
        return {
          nextRunAt: null,
          message: "試合終了または中止のためジョブを削除しました",
        };
      }

      const nextRunAt = new Date(request.now.getTime() + nextInterval * 60_000);

      // 「次回の1本」を上書き更新
      await this.scheduler.upsertCheckpoint({
        jobKey: request.jobKey,
        runAt: nextRunAt,
        endpointPath: "/cron/run-game-checkpoint",
        query: { gameId: gameIdStr, jobKey: request.jobKey },
      });

      return {
        nextRunAt,
        message: `${nextRunAt.toISOString()}に次のチェックポイントを実行します。`,
      };
    } catch (err: unknown) {
      if (
        err instanceof DomainError ||
        err instanceof ValidationError ||
        err instanceof NotFoundError
      ) {
        throw err;
      }
      throw new DomainError(
        "チェックポイントスケジューラの実行に失敗しました",
        {
          cause: err,
          jobKey: request.jobKey,
        }
      );
    }
  }
}
