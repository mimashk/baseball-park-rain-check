import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { CheckpointScheduler } from "../interfaces/CheckpointScheduler";
import { DecideNextIntervalMinutesService } from "../services/DecideNextIntervalMinutesService";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { ScheduleInitialGameCheckpointRequest } from "../dtos/ScheduleInitialGameCheckpointRequest";
import { ScheduleInitialGameCheckpointResponse } from "../dtos/ScheduleInitialGameCheckpointResponse";
import { ensureValidDate } from "../../shared/utils/ensureValidDate";

export class ScheduleInitialGameCheckpointUseCase {
  constructor(
    private readonly scheduler: CheckpointScheduler,
    private readonly gameRepository: ScheduledGameRepository,
  ) {}

  async execute(
    req: ScheduleInitialGameCheckpointRequest,
  ): Promise<ScheduleInitialGameCheckpointResponse> {
    const normalizedNow = ensureValidDate("now", req.now);
    const games = await this.gameRepository.findAtDate(normalizedNow);
    if (games.length === 0) {
      return {
        message: "指定日の試合がないため初回チェックポイントは作成しません",
      };
    }

    const checkpoints: Array<{
      gameId: string;
      jobKey: string;
      nextRunAt: Date;
    }> = [];
    for (const game of games) {
      const normalizedStartAt = ensureValidDate("startAt", game.date);

      // 初回は scheduled 前提で次の間隔を計算
      const nextInterval = DecideNextIntervalMinutesService.execute({
        now: normalizedNow,
        startAt: normalizedStartAt,
        status: GameStatusType.SCHEDULED,
        isNightGame: game.isNightGame(),
      });

      // もし既に終了/過去ならスキップ
      if (nextInterval === null) {
        continue;
      }

      const nextRunAt = new Date(
        normalizedNow.getTime() + nextInterval * 60_000,
      );
      const jobKey = `checkpoint-${game.date.getFullYear()}-${
        game.date.getMonth() + 1
      }-${game.date.getDate()}-${game.id.toString()}`;

      await this.scheduler.upsertCheckpoint({
        jobKey,
        runAt: nextRunAt,
        endpointPath: "/cron/run-game-checkpoint",
        query: { gameId: game.id.toString(), jobKey },
      });

      checkpoints.push({
        gameId: game.id.toString(),
        jobKey,
        nextRunAt,
      });
    }

    if (checkpoints.length === 0) {
      return {
        message: "初回チェックポイントを登録する必要がありません",
      };
    }

    return {
      message: `${checkpoints.length}件の初回チェックポイントを登録しました`,
      checkpoints,
    };
  }
}
