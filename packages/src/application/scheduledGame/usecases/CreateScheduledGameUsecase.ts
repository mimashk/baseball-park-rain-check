import { ScheduledGame } from "../../../domain/scheduledGame/entities/ScheduledGame";
import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { BallParkCatalog } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { CreateScheduledGameRequest } from "../dtos/CreateScheduledGameRequest";
import { CreateScheduledGameResponse } from "../dtos/CreateScheduledGameResponse";
import { mapScheduledGameDtoToCreateProps } from "../mapper/mapScheduledGameDtoToCreateProps";
import { FetchScheduledGamesService } from "../services/FetchScheduledGamesService";

export class CreateScheduledGameUsecase {
  constructor(
    private readonly fetchScheduledGamesService: FetchScheduledGamesService,
    private readonly scheduledGameRepository: ScheduledGameRepository
  ) {}

  async execute(
    request: CreateScheduledGameRequest
  ): Promise<CreateScheduledGameResponse> {
    const normalizedFrom = new Date(request.from);
    const normalizedTo = new Date(request.to);
    const rawScheduledGames = await this.fetchScheduledGamesService.exec(
      normalizedFrom,
      normalizedTo
    );
    const scheduledGames = rawScheduledGames.map((rawScheduledGame) => {
      const domainProps = mapScheduledGameDtoToCreateProps(rawScheduledGame);
      if (
        domainProps.ballPark !== BallParkCatalog.HANSHIN_KOSHIEN_STADIUM.labelJa
      ) {
        return null;
      }
      return ScheduledGame.create(domainProps);
    });
    const filteredScheduledGames = scheduledGames.filter((g) => g !== null);
    await this.scheduledGameRepository.upsertMany(filteredScheduledGames);
    return {
      gameIds: filteredScheduledGames.map((scheduledGame) =>
        scheduledGame.id.toString()
      ),
      message: `${normalizedFrom.toISOString()}から${normalizedTo.toISOString()}間の${
        scheduledGames.length
      }試合を作成しました`,
    };
  }
}
