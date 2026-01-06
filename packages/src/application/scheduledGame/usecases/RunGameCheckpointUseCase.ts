import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { GameId } from "../../../domain/scheduledGame/valueObjects/GameId";
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
    const gameId = GameId.fromString(request.gameId);
    const game = await this.gameRepository.findById(gameId);
    if (!game) {
      throw new Error("試合が見つかりません");
    }

    const status = await this.updateGameStatusService.execute(gameId);

    const nextInterval = DecideNextIntervalMinutesService.execute({
      now: request.now,
      startAt: game.date,
      status,
    });

    if (nextInterval === null) {
      // 終了：次回は不要。ジョブを消す（one-shot風）
      await this.scheduler.deleteCheckpoint(request.jobKey);
      return {
        nextRunAt: null,
        message: `${game.date.toISOString()}の試合が終了もしくは中止となりました。`,
      };
    }

    const nextRunAt = new Date(request.now.getTime() + nextInterval * 60_000);

    // 「次回の1本」を上書き更新
    await this.scheduler.upsertCheckpoint({
      jobKey: request.jobKey,
      runAt: nextRunAt,
      endpointPath: "/cron/checkpoint",
      query: { gameId: request.gameId, jobKey: request.jobKey },
    });

    return {
      nextRunAt,
      message: `${nextRunAt.toISOString()}に次のチェックポイントを実行します。`,
    };
  }
}
