import { ScheduledGameModel } from "../prisma/generate/models/ScheduledGame";
import { ScheduledGame } from "../../../../domain/scheduledGame/entities/ScheduledGame";
import { ScheduledGameRepository } from "../../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { BallPark } from "../../../../domain/scheduledGame/valueObjects/BallPark";
import { BaseballTeam } from "../../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { GameCategory } from "../../../../domain/scheduledGame/valueObjects/GameCategory";
import { GameId } from "../../../../domain/scheduledGame/valueObjects/GameId";
import {
  GameStatus,
  GameStatusType,
} from "../../../../domain/scheduledGame/valueObjects/GameStatus";
import { PrismaClientWrapper } from "../PrismaClientWrapper";
import { DbError } from "../../../../shared/errors/DbError";
import { AppError } from "../../../../shared/errors/AppError";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";

type ScheduledGamePersistence = Omit<
  ScheduledGameModel,
  "createdAt" | "updatedAt"
>;

export class PrismaScheduledGameRepository implements ScheduledGameRepository {
  private prisma = PrismaClientWrapper.getInstance();
  constructor() {}

  async upsertMany(games: ScheduledGame[]): Promise<void> {
    const data = games.map(this.toPersistence);
    try {
      await this.prisma.$transaction(
        data.map((row) =>
          this.prisma.scheduledGame.upsert({
            where: { id: row.id },
            create: row,
            update: row,
          })
        )
      );
    } catch (err) {
      throw new DbError("試合予定データのupsertに失敗しました", {
        cause: err,
        details: { count: data.length },
      });
    }
  }

  async updateStatus(gameId: GameId, status: GameStatusType): Promise<void> {
    try {
      await this.prisma.scheduledGame.update({
        where: { id: gameId.toString() },
        data: { status },
      });
    } catch (err) {
      throw new DbError("試合ステータスの更新に失敗しました", {
        cause: err,
        details: { gameId: gameId.toString(), status },
      });
    }
  }

  async findByDate(from: Date, to: Date): Promise<ScheduledGame[]> {
    let rows: ScheduledGameModel[];
    try {
      rows = await this.prisma.scheduledGame.findMany({
        where: { date: { gte: from, lte: to } },
        orderBy: { date: "asc" },
      });
    } catch (err) {
      throw new DbError("試合予定データの取得に失敗しました", {
        cause: err,
        details: { from, to },
      });
    }
    return this.mapRows(rows);
  }

  async findById(id: GameId): Promise<ScheduledGame | null> {
    let row: ScheduledGameModel | null;
    try {
      row = await this.prisma.scheduledGame.findUnique({
        where: { id: id.toString() },
      });
    } catch (err) {
      throw new DbError("試合予定データの取得に失敗しました", {
        cause: err,
        details: { id: id.toString() },
      });
    }
    return row ? this.mapRow(row) : null;
  }

  private mapRows(rows: ScheduledGameModel[]): ScheduledGame[] {
    try {
      return rows.map(this.toDomain);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new InfrastructureError(
        "mapping",
        "DBレコードをドメインに変換できません",
        {
          cause: err,
        }
      );
    }
  }

  private mapRow(row: ScheduledGameModel): ScheduledGame {
    try {
      return this.toDomain(row);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new InfrastructureError(
        "mapping",
        "DBレコードをドメインに変換できません",
        {
          cause: err,
        }
      );
    }
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
