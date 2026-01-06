import { BallPark } from "../valueObjects/BallPark";
import { BaseballTeam } from "../valueObjects/BaseballTeam";
import { GameCategory } from "../valueObjects/GameCategory";
import { GameId } from "../valueObjects/GameId";
import { GameStatus } from "../valueObjects/GameStatus";

export interface CreateScheduledGameProps {
  date: Date;
  category: string;
  homeTeam: string;
  awayTeam: string;
  ballPark: string;
}

export interface UpdateScheduledGameProps {
  date?: Date;
  category?: string;
  homeTeam?: string;
  awayTeam?: string;
  ballPark?: string;
}

export class ScheduledGame {
  constructor(
    readonly id: GameId,
    readonly date: Date,
    readonly category: GameCategory,
    readonly homeTeam: BaseballTeam,
    readonly awayTeam: BaseballTeam,
    readonly ballPark: BallPark,
    private _status: GameStatus // メインスポンサーとイベントを追加したいが、MVPだといらないかなと思うので一旦省略
  ) {}

  static create(props: CreateScheduledGameProps): ScheduledGame {
    return new ScheduledGame(
      GameId.generate(),
      props.date,
      GameCategory.from(props.category),
      BaseballTeam.from(props.homeTeam),
      BaseballTeam.from(props.awayTeam),
      BallPark.from(props.ballPark),
      GameStatus.scheduled()
    );
  }

  update(props: UpdateScheduledGameProps): ScheduledGame {
    return new ScheduledGame(
      this.id,
      props.date ?? this.date,
      props.category ? GameCategory.from(props.category) : this.category,
      props.homeTeam ? BaseballTeam.from(props.homeTeam) : this.homeTeam,
      props.awayTeam ? BaseballTeam.from(props.awayTeam) : this.awayTeam,
      props.ballPark ? BallPark.from(props.ballPark) : this.ballPark,
      this._status
    );
  }

  status(): GameStatus {
    return this._status;
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
}
