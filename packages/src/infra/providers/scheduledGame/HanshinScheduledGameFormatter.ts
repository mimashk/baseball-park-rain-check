import { BallParkNameMapper } from "../../../application/shared/interfaces/BallParkNameMapper";
import { ScheduledGameDto } from "../../../application/scheduledGame/dtos/ScheduledGameDto";
import { TeamNameMapper } from "../../../application/shared/interfaces/TeamNameMapper";
import { ScheduledGameInfo } from "./HanshinScheduledGameScraper";

export class HanshinScheduledGameFormatter {
  constructor(
    private readonly teamNameMapper: TeamNameMapper,
    private readonly ballParkNameMapper: BallParkNameMapper
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
    return {
      date,
      category: gameInfo.category,
      homeTeam,
      awayTeam,
      ballPark,
    };
  }

  private buildDate(
    year: number,
    month: number,
    day: number,
    startTime: string
  ): Date {
    return new Date(
      year,
      month - 1,
      day,
      parseInt(startTime.split(":")[0]),
      parseInt(startTime.split(":")[1])
    );
  }
}
