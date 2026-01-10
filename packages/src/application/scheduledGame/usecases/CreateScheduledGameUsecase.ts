import { ScheduledGame } from "../../../domain/scheduledGame/entities/ScheduledGame";
import { ScheduledGameRepository } from "../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { BallParkCatalog } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
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
    if (
      Number.isNaN(normalizedFrom.getTime()) ||
      Number.isNaN(normalizedTo.getTime())
    ) {
      throw new ValidationError("日付が不正です", {
        from: request.from,
        to: request.to,
      });
    }
    if (request.from > request.to) {
      throw new ValidationError(
        "開始日は終了日より前の日付を指定してください",
        {
          from: request.from,
          to: request.to,
        }
      );
    }
    try {
      const rawScheduledGames = await this.fetchScheduledGamesService.exec(
        normalizedFrom,
        normalizedTo
      );
      const scheduledGames = rawScheduledGames.map((rawScheduledGame) => {
        const domainProps = mapScheduledGameDtoToCreateProps(rawScheduledGame);
        if (
          domainProps.ballPark !==
          BallParkCatalog.HANSHIN_KOSHIEN_STADIUM.labelJa
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
    } catch (err: unknown) {
      // ドメイン系はそのまま再throw
      if (err instanceof DomainError || err instanceof ValidationError) {
        throw err;
      }
      // 外部I/O（取得/永続化）例外を正規化
      throw new DomainError("試合情報の作成に失敗しました", {
        cause: err,
        from: normalizedFrom,
        to: normalizedTo,
      });
    }
  }
}
