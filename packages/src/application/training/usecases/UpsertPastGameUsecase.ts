import { BallParkCatalog } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { PastGameRecordRepository } from "../../../domain/training/repositoryInterface/PastGameRecordRepository";
import { PastGameRecord } from "../../../domain/training/valueObjects/PastGameRecord";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDateRange } from "../../shared/utils/ensureValidDateRange";
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
    const { from: normalizedFrom, to: normalizedTo } = ensureValidDateRange(
      "from",
      "to",
      request.from,
      request.to
    );
    try {
      const rawPastGames = await this.fetchPastGamesService.exec(
        normalizedFrom,
        normalizedTo
      );
      const pastGames = rawPastGames
        .map((rawPastGame) => {
          try {
            const domainProps = mapPastGameDtoToCreateProps(rawPastGame);
            if (
              domainProps.ballPark !==
              BallParkCatalog.HANSHIN_KOSHIEN_STADIUM.labelJa
            ) {
              return null;
            }
            return PastGameRecord.create(domainProps); // ドメイン例外は上へ
          } catch (err: unknown) {
            throw new ValidationError("過去試合データの変換に失敗しました", {
              game: rawPastGame,
              cause: err,
            });
          }
        })
        .filter((g): g is PastGameRecord => g !== null);

      await this.pastGameRepository.upsertMany(pastGames);

      return {
        message: `${normalizedFrom.toISOString()}から${normalizedTo.toISOString()}間の${
          pastGames.length
        }試合を作成しました`,
      };
    } catch (err) {
      if (err instanceof DomainError || err instanceof ValidationError)
        throw err;
      throw new DomainError("過去試合の更新に失敗しました", {
        cause: err,
        from: request.from,
        to: request.to,
      });
    }
  }
}
