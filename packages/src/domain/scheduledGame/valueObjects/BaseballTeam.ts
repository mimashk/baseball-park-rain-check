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

export class BaseballTeam {
  private constructor(readonly value: BaseballTeamType) {}

  static from(rawValue: string): BaseballTeam {
    if (!this.isBaseballTeam(rawValue)) {
      throw new Error("不正なチーム名です");
    }
    return new BaseballTeam(rawValue);
  }

  private static isBaseballTeam(value: string): value is BaseballTeamType {
    return (Object.values(BaseballTeamType) as readonly string[]).includes(
      value
    );
  }

  labelJa(): string {
    return BaseballTeamType[this.value];
  }
}
