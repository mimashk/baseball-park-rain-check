import { Prisma, ScheduledGame as ScheduledGameModel } from "@prisma/client";
import { ScheduledGame } from "../../../../domain/scheduledGame/entities/ScheduledGame";
import { ScheduledGameRepository } from "../../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { TeamId } from "../../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { GameId } from "../../../../domain/scheduledGame/valueObjects/GameId";
import { GameStatusType } from "../../../../domain/scheduledGame/valueObjects/GameStatus";
import { PrismaClientWrapper } from "../PrismaClientWrapper";
import { DbError } from "../../../../shared/errors/DbError";
import { AppError } from "../../../../shared/errors/AppError";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";
import { PrismaClient } from "@prisma/client";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";

type ScheduledGamePersistence = Omit<
  ScheduledGameModel,
  "createdAt" | "updatedAt"
>;

export class PrismaScheduledGameRepository implements ScheduledGameRepository {
  constructor(
    private readonly prisma: PrismaClient = PrismaClientWrapper.getInstance(),
    private readonly trx?: Prisma.TransactionClient
  ) {}

  withTransaction(trx: TransactionContext): ScheduledGameRepository {
    return new PrismaScheduledGameRepository(
      this.prisma,
      trx as unknown as Prisma.TransactionClient
    );
  }

  private db() {
    return this.trx ?? this.prisma;
  }

  async upsertMany(games: ScheduledGame[]): Promise<void> {
    const data = games.map(this.toPersistence);
    try {
      await Promise.all(
        data.map((row) =>
          this.db().scheduledGame.upsert({
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
      await this.db().scheduledGame.update({
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
      rows = await this.db().scheduledGame.findMany({
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
      row = await this.db().scheduledGame.findUnique({
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

  async findAtDate(date: Date): Promise<ScheduledGame[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    let rows: ScheduledGameModel[];
    try {
      rows = await this.db().scheduledGame.findMany({
        where: { date: { gte: start, lte: end } },
      });
    } catch (err) {
      throw new DbError("試合予定データの取得に失敗しました", {
        cause: err,
        details: { date },
      });
    }
    return this.mapRows(rows);
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
      homeTeam: game.homeTeam.id(),
      awayTeam: game.awayTeam.id(),
      ballPark: game.ballPark.name(),
      status: game.status().value,
    };
  }

  private toDomain = (row: ScheduledGamePersistence): ScheduledGame =>
    ScheduledGame.reconstruct({
      id: row.id,
      date: row.date,
      category: row.category,
      homeTeam: row.homeTeam as TeamId,
      awayTeam: row.awayTeam as TeamId,
      ballPark: row.ballPark,
      status: row.status,
    });
}
