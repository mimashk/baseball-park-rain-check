import { ScheduledGameRepository } from "@domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { CheckpointScheduler } from "../interfaces/CheckpointScheduler";
import { ensureValidDateRange } from "@application/shared/utils/ensureValidDateRange";
import { DecideNextIntervalMinutesService } from "../services/DecideNextIntervalMinutesService";
import { GameStatusType } from "@domain/scheduledGame/valueObjects/GameStatus";
import { ScheduleInitialGameCheckpointRequest } from "../dtos/ScheduleInitialGameCheckpointRequest";
import { ScheduleInitialGameCheckpointResponse } from "../dtos/ScheduleInitialGameCheckpointResponse";

export class ScheduleInitialGameCheckpointUseCase {
  constructor(
    private readonly scheduler: CheckpointScheduler,
    private readonly gameRepository: ScheduledGameRepository
  ) {}

  async execute(
    req: ScheduleInitialGameCheckpointRequest
  ): Promise<ScheduleInitialGameCheckpointResponse> {
    const games = await this.gameRepository.findAtDate(req.now);
    if (games.length === 0) {
      return {
        message: "指定日の試合がないため初回チェックポイントは作成しません",
      };
    }
    // [TODO]一旦1試合のみなので先頭を取得
    const game = games[0];

    // now と startAt を正規化
    const { from: normalizedNow, to: normalizedStartAt } = ensureValidDateRange(
      "now",
      "startAt",
      req.now,
      game.date
    );

    // 初回は scheduled 前提で次の間隔を計算
    const nextInterval = DecideNextIntervalMinutesService.execute({
      now: normalizedNow,
      startAt: normalizedStartAt,
      status: GameStatusType.SCHEDULED,
    });

    // もし既に終了/過去ならスキップ
    if (nextInterval === null) {
      return {
        message:
          "初回チェックポイントを登録する必要がありません（過去試合など）",
      };
    }

    const nextRunAt = new Date(normalizedNow.getTime() + nextInterval * 60_000);
    const jobKey = `checkpoint-${game.date.getFullYear()}-${
      game.date.getMonth() + 1
    }-${game.date.getDate()}-${game.id.toString()}`;

    await this.scheduler.upsertCheckpoint({
      jobKey,
      runAt: nextRunAt,
      endpointPath: "/cron/checkpoint",
      query: { gameId: game.id.toString(), jobKey },
    });

    return {
      nextRunAt,
      jobKey,
      message: `${nextRunAt.toISOString()} に初回チェックポイントを登録しました`,
    };
  }
}
