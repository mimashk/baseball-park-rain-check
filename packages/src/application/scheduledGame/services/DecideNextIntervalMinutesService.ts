import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDateRange } from "../../shared/utils/ensureValidDateRange";

const MINUTES_BEFORE_START = 120;
const MINUTES_AFTER_START = 180;
const SHORT_MINUTES_INTERVAL = 10;
const LONG_MINUTES_INTERVAL = 30;

export class DecideNextIntervalMinutesService {
  static execute(params: {
    now: Date;
    startAt: Date;
    status: GameStatusType;
  }): number | null {
    const { now, startAt, status } = params;

    const { from, to } = ensureValidDateRange("now", "startAt", now, startAt);
    const diffMs = from.getTime() - to.getTime();
    const diffMin = diffMs / 60_000;

    // 試合前：開始2時間前〜開始まで = 10分間隔
    if (diffMin < 0) {
      const minutesToStart = -diffMin;
      if (minutesToStart <= MINUTES_BEFORE_START) return SHORT_MINUTES_INTERVAL;
      // 2時間より前は監視しない（次は開始2時間前に合わせる、など）
      return Math.ceil((minutesToStart - MINUTES_BEFORE_START) / 10) * 10; // 雑に「2時間前へ寄せる」でもOK
    }

    // 試合開始〜3時間 = 30分間隔
    if (diffMin <= MINUTES_AFTER_START) return LONG_MINUTES_INTERVAL;

    // 3時間以降 = 10分間隔（完了 or 中止まで）
    return SHORT_MINUTES_INTERVAL;
  }
}
