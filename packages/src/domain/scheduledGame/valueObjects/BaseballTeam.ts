import { DomainError } from "../../../shared/errors/DomainError";
import { ensureTextPresent } from "../../shared/utils/ensurePresent";

export const BaseballTeamType = [
  "東京ヤクルトスワローズ",
  "読売ジャイアンツ",
  "阪神タイガース",
  "広島東洋カープ",
  "中日ドラゴンズ",
  "横浜DeNAベイスターズ",
  "北海道日本ハムファイターズ",
  "千葉ロッテマリーンズ",
  "オリックスバファローズ",
  "埼玉西武ライオンズ",
  "福岡ソフトバンクホークス",
  "東北楽天ゴールデンイーグルス",
] as const;

export type BaseballTeamType = (typeof BaseballTeamType)[number];
export type UnknownTeam = string & { readonly __brand?: "UnknownTeam" };
export type AnyTeamName = BaseballTeamType | UnknownTeam;
export class BaseballTeam {
  private constructor(readonly value: BaseballTeamType) {}

  static from(rawValue: string): BaseballTeam {
    const name = ensureTextPresent("チーム名", rawValue); // 空/undefined/null/空白のみを弾く
    if (!this.isKnownBaseballTeam(name)) {
      throw new DomainError("不正なチーム名です");
    }
    return new BaseballTeam(name);
  }

  private static isKnownBaseballTeam(value: string): value is BaseballTeamType {
    return (Object.values(BaseballTeamType) as readonly string[]).includes(
      value
    );
  }

  labelJa(): BaseballTeamType {
    return this.value;
  }
}
