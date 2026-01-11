import { DomainError } from "../../../shared/errors/DomainError";
import { ensureTextPresent } from "../../shared/utils/ensurePresent";

export const GameCategoryType = {
  REGULAR_SEASON: "セ・リーグ公式戦",
  EXHIBITION: "オープン戦",
  INTERLEAGUE: "セ・パ交流戦",
  CLIMAX_SERIES: "クライマックスシリーズ",
  JAPAN_SERIES: "日本シリーズ",
  PRACTICE: "練習試合",
} as const;

export type GameCategoryType =
  (typeof GameCategoryType)[keyof typeof GameCategoryType];

export class GameCategory {
  private constructor(readonly value: GameCategoryType) {}

  static from(rawValue: string): GameCategory {
    const value = ensureTextPresent("試合カテゴリ", rawValue); // 空/undefined/nullを弾く
    if (!this.isGameCategory(rawValue)) {
      throw new DomainError("不正な試合カテゴリです");
    }
    return new GameCategory(rawValue);
  }

  private static isGameCategory(value: string): value is GameCategoryType {
    return (Object.values(GameCategoryType) as readonly string[]).includes(
      value
    );
  }

  labelJa(): string {
    return this.value;
  }
}
