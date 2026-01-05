import { BallPark } from "../../scheduledGame/valueObjects/BallPark";
import { BaseballTeam } from "../../scheduledGame/valueObjects/BaseballTeam";
import { GameStartTime } from "../../scheduledGame/valueObjects/GameStartTime";
import { GameCancelled } from "./GameCancelled";
import { TrainingKey } from "./TrainingKey";

export interface CreatePastGameRecordProps {
  date: string;
  startTime: string;
  homeTeam: string;
  awayTeam: string;
  ballPark: string;
  cancelled: boolean;
}

export class PastGameRecord {
  constructor(
    readonly trainingKey: TrainingKey,
    readonly date: Date,
    readonly startTime: GameStartTime,
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
    const trainingKey = TrainingKey.create({
      date: props.date,
      ballPark: props.ballPark,
      startHour: props.startTime,
    });
    return new PastGameRecord(
      trainingKey,
      normalizedDate,
      GameStartTime.from(props.startTime),
      BaseballTeam.from(props.homeTeam),
      BaseballTeam.from(props.awayTeam),
      BallPark.from(props.ballPark),
      GameCancelled.fromBoolean(props.cancelled)
    );
  }
}
