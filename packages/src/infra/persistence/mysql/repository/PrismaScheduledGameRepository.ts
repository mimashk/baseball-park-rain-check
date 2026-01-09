import { ScheduledGameModel } from "../prisma/generate/models/ScheduledGame";
import { ScheduledGame } from "../../../../domain/scheduledGame/entities/ScheduledGame";
import { ScheduledGameRepository } from "../../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { BallPark } from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { BaseballTeam } from "../../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { GameCategory } from "../../../../domain/scheduledGame/valueObjects/GameCategory";
import { GameId } from "../../../../domain/scheduledGame/valueObjects/GameId";
import { GameStatus } from "../../../../domain/scheduledGame/valueObjects/GameStatus";
import { PrismaClientWrapper } from "../PrismaClientWrapper";

type ScheduledGamePersistence = Omit<
  ScheduledGameModel,
  "createdAt" | "updatedAt"
>;

export class PrismaScheduledGameRepository implements ScheduledGameRepository {
  private prisma = PrismaClientWrapper.getInstance();
  constructor() {}

  async upsertMany(games: ScheduledGame[]): Promise<void> {
    const data = games.map(this.toPersistence);
    await this.prisma.$transaction(
      data.map((row) =>
        this.prisma.scheduledGame.upsert({
          where: { id: row.id },
          create: row,
          update: row,
        })
      )
    );
  }

  async updateStatus(gameId: GameId, status: string): Promise<void> {
    await this.prisma.scheduledGame.update({
      where: { id: gameId.toString() },
      data: { status },
    });
  }

  async findByDate(from: Date, to: Date): Promise<ScheduledGame[]> {
    const rows = await this.prisma.scheduledGame.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    });
    return rows.map(this.toDomain);
  }

  async findById(id: GameId): Promise<ScheduledGame | null> {
    const row = await this.prisma.scheduledGame.findUnique({
      where: { id: id.toString() },
    });
    return row ? this.toDomain(row) : null;
  }

  private toPersistence(game: ScheduledGame): ScheduledGamePersistence {
    return {
      id: game.id.toString(),
      date: game.date,
      category: game.category.value,
      homeTeam: game.homeTeam.value,
      awayTeam: game.awayTeam.value,
      ballPark: game.ballPark.name(),
      status: game.status().value,
    };
  }

  private toDomain = (row: ScheduledGamePersistence): ScheduledGame =>
    new ScheduledGame(
      GameId.fromString(row.id),
      row.date,
      GameCategory.from(row.category),
      BaseballTeam.from(row.homeTeam),
      BaseballTeam.from(row.awayTeam),
      BallPark.fromString(row.ballPark),
      // GameStatus は遷移を踏んで再構築
      (() => {
        let status = GameStatus.scheduled();
        if (row.status === "in_progress") status = status.toInProgress();
        if (row.status === "completed")
          status = status.toInProgress().toCompleted();
        if (row.status === "cancelled") status = status.toCancelled();
        return status;
      })()
    );
}
