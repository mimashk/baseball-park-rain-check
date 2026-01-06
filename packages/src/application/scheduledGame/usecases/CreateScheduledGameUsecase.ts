import { ScheduledGame } from "../../../domain/scheduledGame/entities/ScheduledGame";
import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { CreateScheduledGameRequest } from "../dtos/CreateScheduledGameRequest";
import { CreateScheduledGameResponse } from "../dtos/CreateScheduledGameResponse";
import { ScheduledGameFetcher } from "../interfaces/ScheduledGameFetcher";

export class CreateScheduledGameUsecase {
  constructor(
    private readonly scheduledGameFetcher: ScheduledGameFetcher,
    private readonly scheduledGameRepository: ScheduledGameRepository
  ) {}

  async execute(
    request: CreateScheduledGameRequest
  ): Promise<CreateScheduledGameResponse> {
    const normalizedFrom = new Date(request.from);
    const normalizedTo = new Date(request.to);
    const rawScheduledGames =
      await this.scheduledGameFetcher.fetchScheduledGames(
        normalizedFrom,
        normalizedTo
      );
    const scheduledGames = rawScheduledGames.map((rawScheduledGame) =>
      ScheduledGame.create(rawScheduledGame)
    );
    await Promise.all(
      scheduledGames.map((scheduledGame) =>
        this.scheduledGameRepository.upsert(scheduledGame)
      )
    );
    return {
      gameIds: scheduledGames.map((scheduledGame) =>
        scheduledGame.id.toString()
      ),
      message: `${normalizedFrom.toISOString()}から${normalizedTo.toISOString()}間の${
        scheduledGames.length
      }試合を作成しました`,
    };
  }
}
