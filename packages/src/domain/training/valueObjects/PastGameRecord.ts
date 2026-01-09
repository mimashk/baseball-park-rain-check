import { BallPark } from "../../scheduledGame/valueObjects/BallPark";
import { BaseballTeam } from "../../scheduledGame/valueObjects/BaseballTeam";
import { GameCancelled } from "./GameCancelled";

export interface CreatePastGameRecordProps {
  date: Date;
  homeTeam: string;
  awayTeam: string;
  ballPark: string;
  cancelled: boolean;
}

export class PastGameRecord {
  constructor(
    readonly date: Date,
    readonly homeTeam: BaseballTeam,
    readonly awayTeam: BaseballTeam,
    readonly ballPark: BallPark,
    readonly cancelled: GameCancelled
  ) {}

  static create(props: CreatePastGameRecordProps): PastGameRecord {
    const normalizedDate = new Date(props.date);
    const today = new Date();
    if (normalizedDate > today) {
      throw new Error("過去の試合ではありません");
    }
    return new PastGameRecord(
      normalizedDate,
      BaseballTeam.from(props.homeTeam),
      BaseballTeam.from(props.awayTeam),
      BallPark.fromString(props.ballPark),
      GameCancelled.fromBoolean(props.cancelled)
    );
  }
}
