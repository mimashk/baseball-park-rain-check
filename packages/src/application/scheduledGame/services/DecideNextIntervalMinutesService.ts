import { GameStatusType } from "../../../domain/scheduledGame/valueObjects/GameStatus";
import { ensureValidDate } from "../../shared/utils/ensureValidDate";

const MINUTES_BEFORE_START = 120;
const NIGHT_GAME_WATCH_LEAD = 360; // ナイトゲームは6時間前(≈昼)から監視開始
const MINUTES_AFTER_START = 180;
const SHORT_MINUTES_INTERVAL = 10;
const LONG_MINUTES_INTERVAL = 30;
const COARSE_MINUTES_INTERVAL = 30;

export class DecideNextIntervalMinutesService {
  static execute(params: {
    now: Date;
    startAt: Date;
    status: GameStatusType;
    isNightGame?: boolean;
  }): number | null {
    const { now, startAt, status, isNightGame = false } = params;

    const normalizedNow = ensureValidDate("now", now);
    const normalizedStartAt = ensureValidDate("startAt", startAt);

    const diffMin =
      (normalizedNow.getTime() - normalizedStartAt.getTime()) / 60_000;

    // 試合前
    if (diffMin < 0) {
      const minutesToStart = -diffMin;
      const watchLead = isNightGame
        ? NIGHT_GAME_WATCH_LEAD
        : MINUTES_BEFORE_START;

      // 開始2時間前〜開始まで = 10分間隔
      if (minutesToStart <= MINUTES_BEFORE_START) return SHORT_MINUTES_INTERVAL;
      // 監視開始〜開始2時間前 = 粗い間隔（早期の中止発表を拾う）
      if (minutesToStart <= watchLead) return COARSE_MINUTES_INTERVAL;
      // 監視開始より前は監視開始点（watchLead前）に寄せる
      return (
        Math.ceil((minutesToStart - watchLead) / COARSE_MINUTES_INTERVAL) *
        COARSE_MINUTES_INTERVAL
      );
    }

    // 試合開始〜3時間 = 30分間隔
    if (diffMin <= MINUTES_AFTER_START) return LONG_MINUTES_INTERVAL;

    // 3時間以降 = 10分間隔（完了 or 中止まで）
    return SHORT_MINUTES_INTERVAL;
  }
}
