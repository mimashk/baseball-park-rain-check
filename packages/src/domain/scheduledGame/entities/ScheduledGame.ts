import { DomainError } from "../../../shared/errors/DomainError";
import { ensureValidDate } from "../../shared/utils/ensureValidDate";
import { BallPark } from "../valueObjects/BallPark";
import { BaseballTeam, TeamId } from "../valueObjects/BaseballTeam";
import { GameCategory } from "../valueObjects/GameCategory";
import { GameId } from "../valueObjects/GameId";
import { GameStatus } from "../valueObjects/GameStatus";

export interface CreateScheduledGameProps {
  date: Date;
  category: string;
  homeTeam: TeamId;
  awayTeam: TeamId;
  ballPark: string;
}

export interface UpdateScheduledGameProps {
  date?: Date;
  category?: string;
  homeTeam?: TeamId;
  awayTeam?: TeamId;
  ballPark?: string;
}

export interface ReconstructScheduledGameProps {
  id: string;
  date: Date;
  category: string;
  homeTeam: TeamId;
  awayTeam: TeamId;
  ballPark: string;
  status: string;
}

export class ScheduledGame {
  private constructor(
    readonly id: GameId,
    readonly date: Date,
    readonly category: GameCategory,
    readonly homeTeam: BaseballTeam,
    readonly awayTeam: BaseballTeam,
    readonly ballPark: BallPark,
    private _status: GameStatus, // メインスポンサーとイベントを追加したいが、MVPだといらないかなと思うので一旦省略
  ) {}

  static create(props: CreateScheduledGameProps): ScheduledGame {
    const date = ensureValidDate("試合日時", props.date);
    this.ensureTeamsDiffer(props.homeTeam, props.awayTeam);
    return new ScheduledGame(
      GameId.generate(),
      date,
      GameCategory.from(props.category),
      BaseballTeam.from(props.homeTeam),
      BaseballTeam.from(props.awayTeam),
      BallPark.fromString(props.ballPark),
      GameStatus.scheduled(),
    );
  }

  update(props: UpdateScheduledGameProps): ScheduledGame {
    const date = props.date
      ? ensureValidDate("試合日時", props.date)
      : this.date;
    // 更新時に両方指定されて同一にならないようチェック
    if (props.homeTeam && props.awayTeam) {
      ScheduledGame.ensureTeamsDiffer(props.homeTeam, props.awayTeam);
    }
    return new ScheduledGame(
      this.id,
      date,
      props.category ? GameCategory.from(props.category) : this.category,
      props.homeTeam ? BaseballTeam.from(props.homeTeam) : this.homeTeam,
      props.awayTeam ? BaseballTeam.from(props.awayTeam) : this.awayTeam,
      props.ballPark ? BallPark.fromString(props.ballPark) : this.ballPark,
      this._status,
    );
  }

  static reconstruct(props: ReconstructScheduledGameProps): ScheduledGame {
    return new ScheduledGame(
      GameId.fromString(props.id),
      props.date,
      GameCategory.from(props.category),
      BaseballTeam.from(props.homeTeam as TeamId),
      BaseballTeam.from(props.awayTeam as TeamId),
      BallPark.fromString(props.ballPark),
      (() => {
        let status = GameStatus.scheduled();
        if (props.status === "in_progress") status = status.toInProgress();
        if (props.status === "completed")
          status = status.toInProgress().toCompleted();
        if (props.status === "cancelled") status = status.toCancelled();
        return status;
      })(),
    );
  }

  status(): GameStatus {
    return this._status;
  }

  // 開始時刻(JST)が17時以降ならナイトゲームとみなす
  isNightGame(): boolean {
    const jstHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        hour12: false,
      }).format(this.date),
    );
    return jstHour >= 17;
  }

  start(now: Date) {
    const hour = this.date.getHours();
    const minute = this.date.getMinutes();
    const startDateTime = new Date(this.date);
    startDateTime.setHours(hour, minute);
    if (now >= startDateTime) this._status = this._status.toInProgress();
  }

  complete() {
    this._status = this._status.toCompleted();
  }

  cancel() {
    this._status = this._status.toCancelled();
  }

  private static ensureTeamsDiffer(home: string, away: string): void {
    if (home && away && home === away) {
      throw new DomainError("ホームとビジターが同一です", { team: home });
    }
  }
}
