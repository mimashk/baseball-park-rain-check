import { BallParkNameMapper } from "../../../application/shared/interfaces/BallParkNameMapper";
import { ScheduledGameDto } from "../../../application/refresher/dtos/ScheduledGameDto";
import { TeamNameMapper } from "../../../application/shared/interfaces/TeamNameMapper";
import { GameCategoryMapper } from "../../../application/refresher/interfaces/GameCategoryMapper";
import { GameCategoryType } from "../../../domain/scheduledGame/valueObjects/GameCategory";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";
import { ScheduledGameInfo } from "./ScheduledGameScraper";

export class ScheduledGameFormatter {
  constructor(
    private readonly teamNameMapper: TeamNameMapper,
    private readonly ballParkNameMapper: BallParkNameMapper,
    private readonly gameCategoryMapper: GameCategoryMapper
  ) {}
  toDto(gameInfo: ScheduledGameInfo): ScheduledGameDto | null {
    const homeTeam = this.teamNameMapper.toDomainTeam(gameInfo.homeTeam);
    const awayTeam = this.teamNameMapper.toDomainTeam(gameInfo.awayTeam);

    if (!homeTeam || !awayTeam) {
      console.warn("未知のチーム名が見つかったので、スキップします", {
        home: gameInfo.homeTeam,
        away: gameInfo.awayTeam,
        date: { y: gameInfo.year, m: gameInfo.month, d: gameInfo.day },
      });
      return null; // ドメインには渡さない
    }
    const date = this.buildDate(
      gameInfo.year,
      gameInfo.month,
      gameInfo.day,
      gameInfo.startTime
    );
    const ballPark = this.ballParkNameMapper.toDomainBallPark(
      gameInfo.ballPark
    );
    const category = this.requireCategory(gameInfo.category);
    return { date, category, homeTeam, awayTeam, ballPark };
  }

  private buildDate(
    year: number,
    month: number,
    day: number,
    startTime: string
  ): Date {
    const [h, m] = startTime.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) {
      throw new InfrastructureError(
        "mapping",
        `開始時刻の形式が不正です: ${startTime}`
      );
    }

    // 後続処理安定のためにutcへ変換
    const utcMs = Date.UTC(year, month - 1, day, h - 9, m, 0, 0);
    return new Date(utcMs);
  }

  private requireCategory(external: string): GameCategoryType {
    const category = this.gameCategoryMapper.toDomainCategory(external);
    if (!category) {
      throw new InfrastructureError(
        "mapping",
        `未知のゲームカテゴリ: ${external}`
      );
    }
    return category;
  }
}
