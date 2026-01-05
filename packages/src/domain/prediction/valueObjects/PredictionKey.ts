import { BallPark } from "../../scheduledGame/valueObjects/BallPark";
import { GameStartTime } from "../../scheduledGame/valueObjects/GameStartTime";

export interface PredictionKeyProps {
  date: string;
  ballPark: string;
  startHour: string;
}

export class PredictionKey {
  private constructor(
    readonly date: Date, // "2026-01-04" など（JST基準）
    readonly ballPark: BallPark, // 球場を入れると衝突回避できる
    readonly startHour: GameStartTime // 0-23（必要なら）
  ) {}
  static create(props: PredictionKeyProps): PredictionKey {
    if (!props.date || !props.ballPark || !props.startHour) {
      throw new Error("必須項目が不足しています");
    }
    return new PredictionKey(
      new Date(props.date),
      BallPark.from(props.ballPark),
      GameStartTime.from(props.startHour)
    );
  }
  toString(): string {
    const dateString =
      this.date.getFullYear() +
      (this.date.getMonth() + 1) +
      this.date.getDate();
    return `${dateString}_${this.ballPark.name()}_${this.startHour.getHour()}${this.startHour.getMinute()}`;
  }
}
