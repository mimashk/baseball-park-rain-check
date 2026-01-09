import { BallParkCatalog } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { PastGameRecordRepository } from "../../../domain/training/repositoryInterface/PastGameRecordRepository";
import { PastGameRecord } from "../../../domain/training/valueObjects/PastGameRecord";
import { UpsertPastGameRequest } from "../dtos/UpsertPastGameRequest";
import { UpsertPastGameResponse } from "../dtos/UpsertPastGameResponse";
import { mapPastGameDtoToCreateProps } from "../mapper/mapPastGameDtoToCreateProps";
import { FetchPastGamesService } from "../services/FetchPastGamesService";

export class UpsertPastGameRecordUsecase {
  constructor(
    private readonly fetchPastGamesService: FetchPastGamesService,
    private readonly pastGameRepository: PastGameRecordRepository
  ) {}

  async execute(
    request: UpsertPastGameRequest
  ): Promise<UpsertPastGameResponse> {
    const normalizedFrom = new Date(request.from);
    const normalizedTo = new Date(request.to);
    const rawPastGames = await this.fetchPastGamesService.exec(
      normalizedFrom,
      normalizedTo
    );
    const pastGames = rawPastGames.map((rawPastGame) => {
      const domainProps = mapPastGameDtoToCreateProps(rawPastGame);
      if (
        domainProps.ballPark !== BallParkCatalog.HANSHIN_KOSHIEN_STADIUM.labelJa
      ) {
        return null;
      }
      return PastGameRecord.create(domainProps);
    });

    // 甲子園しか使わないので
    const filteredPastGames = pastGames.filter((g) => g !== null);

    await this.pastGameRepository.upsertMany(filteredPastGames);

    return {
      message: `${normalizedFrom.toISOString()}から${normalizedTo.toISOString()}間の${
        filteredPastGames.length
      }試合を作成しました`,
    };
  }
}
