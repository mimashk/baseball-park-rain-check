import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensurePositiveInteger } from "../../shared/utils/ensurePositiveInteger";
import { ensureValidDate } from "../../shared/utils/ensureValidDate";

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

    const normalizedBeforeHours = ensurePositiveInteger(
      "集計時間窓の開始時間",
      beforeHours
    );
    const normalizedAfterHours = ensurePositiveInteger(
      "集計時間窓の終了時間",
      afterHours
    );
    if (normalizedBeforeHours === 0 && normalizedAfterHours === 0) {
      throw new ValidationError(
        "集計時間窓は最低でも1時間分でなければなりません",
        {
          beforeHours: normalizedBeforeHours,
          afterHours: normalizedAfterHours,
        }
      );
    }

    return new TimeWindowSpec(normalizedBeforeHours, normalizedAfterHours);
  }

  /** 集約対象の開始/終了時刻を返す（endはexclusive） */
  toRange(date: Date): { from: Date; to: Date } {
    const normalizedDate = ensureValidDate("集計基準時刻", date);
    const hour = normalizedDate.getHours();
    const minute = normalizedDate.getMinutes();
    const from = new Date(normalizedDate);
    from.setHours(hour - this.beforeHours, minute);
    const to = new Date(normalizedDate);
    to.setHours(hour + this.afterHours, minute);
    return { from, to };
  }
}
