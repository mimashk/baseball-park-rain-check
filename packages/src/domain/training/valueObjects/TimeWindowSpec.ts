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
  toRange(date: Date): { from: Date; to: Date } {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const from = new Date(date);
    from.setHours(hour - this.beforeHours);
    from.setMinutes(minute);
    const to = new Date(date);
    to.setHours(hour + this.afterHours);
    to.setMinutes(minute);
    return { from, to };
  }
}
