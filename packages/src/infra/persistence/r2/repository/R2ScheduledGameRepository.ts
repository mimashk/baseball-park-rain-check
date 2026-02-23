import { ScheduledGameRepository } from "../../../../domain/scheduledGame/repositoryInterface/ScheduledGameRepository";
import { ScheduledGame } from "../../../../domain/scheduledGame/entities/ScheduledGame";
import { GameId } from "../../../../domain/scheduledGame/valueObjects/GameId";
import { GameStatusType } from "../../../../domain/scheduledGame/valueObjects/GameStatus";
import { TeamId } from "../../../../domain/scheduledGame/valueObjects/BaseballTeam";
import { TransactionContext } from "../../../../domain/shared/interfaces/TransactionContext";
import { R2ObjectStore } from "../R2ObjectStore";
import {
  listJstDateKeys,
  toJstDateKeyByParts,
} from "../utils/dateKeyGenerator";
import {
  scheduledGameByDateKey,
  scheduledGameByDatePrefix,
  scheduledGameByIdKey,
} from "../utils/keyBuilders";
import { ObjectStorageError } from "../../../../shared/errors/ObjectStorageError";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";

type ScheduledGameRecord = {
  id: string;
  date: string; // ISO UTC
  category: string;
  homeTeam: string;
  awayTeam: string;
  ballPark: string;
  status: string;
};

export class R2ScheduledGameRepository implements ScheduledGameRepository {
  constructor(private readonly store: R2ObjectStore) {}

  withTransaction(_tx: TransactionContext): ScheduledGameRepository {
    // R2ではトランザクション非対応。現時点方針では no-op。
    return this;
  }

  async upsertMany(games: ScheduledGame[]): Promise<void> {
    try {
      await Promise.all(
        games.flatMap((g) => {
          const rec = this.toRecord(g);
          const jstDate = toJstDateKeyByParts(g.date);
          return [
            this.store.putJson(scheduledGameByIdKey(rec.id), rec),
            this.store.putJson(scheduledGameByDateKey(jstDate, rec.id), rec),
          ];
        })
      );
    } catch (err: unknown) {
      throw new ObjectStorageError("試合予定データのupsertに失敗しました", {
        cause: err,
        details: { count: games.length },
      });
    }
  }

  async updateStatus(gameId: GameId, status: GameStatusType): Promise<void> {
    const id = gameId.toString();
    try {
      const rec = await this.store.getJson<ScheduledGameRecord>(
        scheduledGameByIdKey(id)
      );
      if (!rec) return;
      rec.status = status;
      const jstDate = toJstDateKeyByParts(new Date(rec.date));
      await Promise.all([
        this.store.putJson(scheduledGameByIdKey(id), rec),
        this.store.putJson(scheduledGameByDateKey(jstDate, id), rec),
      ]);
    } catch (err: unknown) {
      throw new ObjectStorageError("試合ステータスの更新に失敗しました", {
        cause: err,
        details: { gameId: gameId.toString(), status },
      });
    }
  }

  async findByDate(from: Date, to: Date): Promise<ScheduledGame[]> {
    const dates = listJstDateKeys(from, to);
    try {
      const keys = (
        await Promise.all(
          dates.map((d) => this.store.listKeys(scheduledGameByDatePrefix(d)))
        )
      ).flat();

      const rows = (
        await Promise.all(
          keys.map((k) => this.store.getJson<ScheduledGameRecord>(k))
        )
      ).filter((v): v is ScheduledGameRecord => Boolean(v));

      return rows
        .map((r) => this.toDomain(r))
        .filter((g) => from <= g.date && g.date <= to)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (err: unknown) {
      throw new ObjectStorageError(
        "日時範囲内の試合予定データの取得に失敗しました",
        {
          cause: err,
          details: { from, to },
        }
      );
    }
  }

  async findAtDate(date: Date): Promise<ScheduledGame[]> {
    const day = toJstDateKeyByParts(date);
    try {
      const keys = await this.store.listKeys(scheduledGameByDatePrefix(day));
      const rows = (
        await Promise.all(
          keys.map((k) => this.store.getJson<ScheduledGameRecord>(k))
        )
      ).filter((v): v is ScheduledGameRecord => Boolean(v));

      return rows.map((r) => this.toDomain(r));
    } catch (err: unknown) {
      throw new ObjectStorageError(
        "指定日の試合予定データの取得に失敗しました",
        {
          cause: err,
          details: { date },
        }
      );
    }
  }

  async findById(id: GameId): Promise<ScheduledGame | null> {
    try {
      const rec = await this.store.getJson<ScheduledGameRecord>(
        scheduledGameByIdKey(id.toString())
      );
      return rec ? this.toDomain(rec) : null;
    } catch (err: unknown) {
      throw new ObjectStorageError(
        "指定IDの試合予定データの取得に失敗しました",
        {
          cause: err,
          details: { id: id.toString() },
        }
      );
    }
  }

  private toRecord(g: ScheduledGame): ScheduledGameRecord {
    try {
      return {
        id: g.id.toString(),
        date: g.date.toISOString(),
        category: g.category.value,
        homeTeam: g.homeTeam.id(),
        awayTeam: g.awayTeam.id(),
        ballPark: g.ballPark.name(),
        status: g.status().value,
      };
    } catch (err: unknown) {
      throw new InfrastructureError(
        "mapping",
        "試合予定データのレコード変換に失敗しました",
        {
          cause: err,
          details: { game: g },
        }
      );
    }
  }

  private toDomain(r: ScheduledGameRecord): ScheduledGame {
    try {
      return ScheduledGame.reconstruct({
        id: r.id,
        date: new Date(r.date),
        category: r.category,
        homeTeam: r.homeTeam as TeamId,
        awayTeam: r.awayTeam as TeamId,
        ballPark: r.ballPark,
        status: r.status,
      });
    } catch (err: unknown) {
      throw new InfrastructureError(
        "mapping",
        "試合予定データのドメイン変換に失敗しました",
        {
          cause: err,
          details: { record: r },
        }
      );
    }
  }
}
