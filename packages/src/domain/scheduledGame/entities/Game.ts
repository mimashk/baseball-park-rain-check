import { BallPark } from "../valueObjects/BallPark";
import { BaseballTeam } from "../valueObjects/BaseballTeam";
import { GameCategory } from "../valueObjects/GameCategory";
import { GameId } from "../valueObjects/GameId";
import { GameStartTime } from "../valueObjects/GameStartTime";
import { GameStatus } from "../valueObjects/GameStatus";

export interface CreateGameProps {
  date: Date;
  startTime: string;
  category: string;
  homeTeam: string;
  awayTeam: string;
  ballPark: string;
}

export interface updateGameProps {
  date?: Date;
  startTime?: string;
  category?: string;
  homeTeam?: string;
  awayTeam?: string;
  ballPark?: string;
}

export class Game {
  constructor(
    readonly id: GameId,
    readonly date: Date,
    readonly startTime: GameStartTime,
    readonly category: GameCategory,
    readonly homeTeam: BaseballTeam,
    readonly awayTeam: BaseballTeam,
    readonly ballPark: BallPark,
    private status: GameStatus // メインスポンサーとイベントを追加したいが、MVPだといらないかなと思うので一旦省略
  ) {}

  static create(props: CreateGameProps): Game {
    return new Game(
      GameId.generate(),
      props.date,
      GameStartTime.from(props.startTime),
      GameCategory.from(props.category),
      BaseballTeam.from(props.homeTeam),
      BaseballTeam.from(props.awayTeam),
      BallPark.from(props.ballPark),
      GameStatus.scheduled()
    );
  }

  update(props: updateGameProps): Game {
    return new Game(
      this.id,
      props.date ?? this.date,
      props.startTime ? GameStartTime.from(props.startTime) : this.startTime,
      props.category ? GameCategory.from(props.category) : this.category,
      props.homeTeam ? BaseballTeam.from(props.homeTeam) : this.homeTeam,
      props.awayTeam ? BaseballTeam.from(props.awayTeam) : this.awayTeam,
      props.ballPark ? BallPark.from(props.ballPark) : this.ballPark,
      this.status
    );
  }

  start(now: Date) {
    const { hour, minute } = this.startTime.getParts();
    const startDateTime = new Date(this.date);
    startDateTime.setHours(hour, minute);
    if (now >= startDateTime) this.status = this.status.toInProgress();
  }

  complete() {
    this.status = this.status.toCompleted();
  }

  cancel() {
    this.status = this.status.toCancelled();
  }
}
