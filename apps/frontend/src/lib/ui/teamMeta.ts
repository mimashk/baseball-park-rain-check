import { TeamId } from "@/types/TeamId";

export const TEAM_META: Record<TeamId, { name: string; fullName: string }> = {
  HT: { name: "阪神", fullName: "阪神タイガース" },
  YG: { name: "巨人", fullName: "読売ジャイアンツ" },
  YS: { name: "ヤクルト", fullName: "東京ヤクルトスワローズ" },
  C: { name: "広島", fullName: "広島東洋カープ" },
  D: { name: "中日", fullName: "中日ドラゴンズ" },
  DB: { name: "DeNA", fullName: "横浜DeNAベイスターズ" },
  F: { name: "日本ハム", fullName: "北海道日本ハムファイターズ" },
  M: { name: "ロッテ", fullName: "千葉ロッテマリーンズ" },
  B: { name: "オリックス", fullName: "オリックスバファローズ" },
  L: { name: "西武", fullName: "埼玉西武ライオンズ" },
  H: { name: "ソフトバンク", fullName: "福岡ソフトバンクホークス" },
  E: { name: "楽天", fullName: "東北楽天ゴールデンイーグルス" },
};

export const TEAM_IDS: TeamId[] = [
  "YS",
  "YG",
  "HT",
  "C",
  "D",
  "DB",
  "F",
  "M",
  "B",
  "L",
  "H",
  "E",
];
