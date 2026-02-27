import { TeamNameMapper } from "../../../application/shared/interfaces/TeamNameMapper";
import { PastGameRecordDto } from "../../../application/training/dtos/PastGameRecordDto";
import { TeamId } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { InfrastructureError } from "../../../shared/errors/InfrastructureError";
import { PastGameInfo } from "./PastGameScraper";
import { BallParkNameMapper } from "../../../application/shared/interfaces/BallParkNameMapper";

export class PastGameFormatter {
  constructor(
    private readonly teamNameMapper: TeamNameMapper,
    private readonly ballParkNameMapper: BallParkNameMapper
  ) {}
  toDto(gameInfo: PastGameInfo): PastGameRecordDto | null {
    const date = this.buildDate(
      gameInfo.year,
      gameInfo.month,
      gameInfo.day,
      gameInfo.startTime
    );
    const homeTeam = this.teamNameMapper.toDomainTeam(
      gameInfo.isAway ? gameInfo.opposingTeam : gameInfo.ourTeam
    );
    const awayTeam = this.teamNameMapper.toDomainTeam(
      gameInfo.isAway ? gameInfo.ourTeam : gameInfo.opposingTeam
    );
    if (!homeTeam || !awayTeam) {
      console.warn("未知のチーム名が見つかったので、スキップします", {
        home: gameInfo.isAway ? gameInfo.opposingTeam : gameInfo.ourTeam,
        away: gameInfo.isAway ? gameInfo.ourTeam : gameInfo.opposingTeam,
        date: { y: gameInfo.year, m: gameInfo.month, d: gameInfo.day },
      });
      return null; // ドメインには渡さない
    }
    const ballPark = this.ballParkNameMapper.toDomainBallPark(
      gameInfo.ballPark
    );
    const cancelled = gameInfo.isCancelled;
    return {
      date,
      homeTeam,
      awayTeam,
      ballPark,
      cancelled,
    };
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
    const utcMs = Date.UTC(year, month - 1, day, h - 9, m, 0, 0); // JST -> UTC
    return new Date(utcMs);
  }

  private requireTeam(external: string): TeamId {
    const team = this.teamNameMapper.toDomainTeam(external);
    if (!team) {
      throw new InfrastructureError("mapping", `未知のチーム名: ${external}`);
    }
    return team;
  }
}
