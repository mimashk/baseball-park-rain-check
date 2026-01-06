import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { GameId } from "../../../domain/scheduledGame/valueObjects/GameId";
import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { GameStatusFetcher } from "../interfaces/GameStatusFetcher";

export class UpdateGameStatusService {
  constructor(
    private readonly gameRepository: ScheduledGameRepository,
    private readonly fetcher: GameStatusFetcher
  ) {}

  async execute(gameId: GameId): Promise<GameStatusType> {
    const game = await this.gameRepository.findById(gameId);
    if (!game) {
      throw new Error("試合が見つかりません");
    }

    // 外部から最新ステータスを取得
    const latest = await this.fetcher.fetchStatus({
      date: game.date,
      homeTeamName: game.homeTeam.labelJa(),
      awayTeamName: game.awayTeam.labelJa(),
    });

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
  }
}
