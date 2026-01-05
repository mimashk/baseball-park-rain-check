import { GameStartTime } from "../../scheduledGame/valueObjects/GameStartTime";

export class TimeWindowSpec {
  private constructor(
    readonly beforeHours: number,
    readonly afterHours: number
  ) {}

  static create(props: {
    beforeHours: number;
    afterHours: number;
  }): TimeWindowSpec {
    const { beforeHours, afterHours } = props;

    if (!Number.isInteger(beforeHours) || beforeHours < 0) {
      throw new Error("集計時間窓の開始時間は0以上でなければなりません");
    }
    if (!Number.isInteger(afterHours) || afterHours < 0) {
      throw new Error("集計時間窓の終了時間は0以上でなければなりません");
    }
    if (beforeHours === 0 && afterHours === 0) {
      throw new Error("集計時間窓は最低でも1時間分でなければなりません");
    }

    return new TimeWindowSpec(beforeHours, afterHours);
  }

  /** 集約対象の開始/終了時刻を返す（endはexclusive） */
  toRange(startTime: GameStartTime): { from: Date; to: Date } {
    const hour = startTime.getHour();
    const from = new Date((hour - this.beforeHours) * 60 * 60 * 1000);
    const to = new Date((hour + this.afterHours) * 60 * 60 * 1000);
    return { from, to };
  }
}
