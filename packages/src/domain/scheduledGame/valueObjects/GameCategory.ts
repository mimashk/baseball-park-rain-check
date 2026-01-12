import { DomainError } from "../../../shared/errors/DomainError";
import { ensureTextPresent } from "../../shared/utils/ensurePresent";

export const GameCategoryType = {
  REGULAR_SEASON: "セ・リーグ公式戦",
  EXHIBITION: "オープン戦",
  INTERLEAGUE: "セ・パ交流戦",
  CLIMAX_SERIES: "クライマックスシリーズ",
  JAPAN_SERIES: "日本シリーズ",
  PRACTICE: "練習試合",
  PRE_SEASON: "プレーシーズンゲーム",
} as const;

export type GameCategoryType =
  (typeof GameCategoryType)[keyof typeof GameCategoryType];
type GameCategoryValue = GameCategoryType | string;

export class GameCategory {
  private constructor(readonly value: GameCategoryValue) {}

  static from(rawValue: string): GameCategory {
    const value = ensureTextPresent("試合カテゴリ", rawValue); // 空/undefined/nullを弾く
    const knownOrRaw = this.toKnownOrRaw(value);
    if (knownOrRaw.length > 30) {
      throw new DomainError("試合カテゴリが長すぎます");
    }
    return new GameCategory(knownOrRaw);
  }

  labelJa(): string {
    return this.value;
  }

  private static toKnownOrRaw(value: string): GameCategoryValue {
    return (Object.values(GameCategoryType) as readonly string[]).includes(
      value
    )
      ? (value as GameCategoryType)
      : value;
  }
}
