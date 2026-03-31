import { TeamId } from "@/types/TeamId";

export type TeamTheme = {
  border: string;
  primary: string;
};

export type Team = {
  id: TeamId;
  shortName: string;
  fullName: string;
  logo: string;
  order: number;
  theme: TeamTheme;
};

export const TEAMS: Team[] = [
  {
    id: "YS",
    shortName: "ヤクルト",
    fullName: "東京ヤクルトスワローズ",
    logo: "/teams/ys.png",
    order: 1,
    theme: { border: "#02A051", primary: "#02A051" },
  },
  {
    id: "YG",
    shortName: "巨人",
    fullName: "読売ジャイアンツ",
    logo: "/teams/yg.png",
    order: 2,
    theme: { border: "#EB9713", primary: "#EB9713" },
  },
  {
    id: "HT",
    shortName: "阪神",
    fullName: "阪神タイガース",
    logo: "/teams/ht.png",
    order: 3,
    theme: { border: "#FEE200", primary: "#FEE200" },
  },
  {
    id: "C",
    shortName: "広島",
    fullName: "広島東洋カープ",
    logo: "/teams/c.png",
    order: 4,
    theme: { border: "#EE161F", primary: "#EE161F" },
  },
  {
    id: "D",
    shortName: "中日",
    fullName: "中日ドラゴンズ",
    logo: "/teams/d.png",
    order: 5,
    theme: { border: "#1eb2e9", primary: "#1eb2e9" },
  },
  {
    id: "DB",
    shortName: "DeNA",
    fullName: "横浜DeNAベイスターズ",
    logo: "/teams/db.png",
    order: 6,
    theme: { border: "#003F8E", primary: "#003F8E" },
  },
  {
    id: "F",
    shortName: "ファイターズ",
    fullName: "北海道日本ハムファイターズ",
    logo: "/teams/f.png",
    order: 7,
    theme: { border: "#01609A", primary: "#01609A" },
  },
  {
    id: "M",
    shortName: "ロッテ",
    fullName: "千葉ロッテマリーンズ",
    logo: "/teams/m.png",
    order: 8,
    theme: { border: "#000000", primary: "#000000" },
  },
  {
    id: "B",
    shortName: "オリックス",
    fullName: "オリックスバファローズ",
    logo: "/teams/b.png",
    order: 9,
    theme: { border: "#A58113", primary: "#A58113" },
  },
  {
    id: "L",
    shortName: "西武",
    fullName: "埼玉西武ライオンズ",
    logo: "/teams/l.png",
    order: 10,
    theme: { border: "#051E46", primary: "#051E46" },
  },
  {
    id: "H",
    shortName: "ホークス",
    fullName: "福岡ソフトバンクホークス",
    logo: "/teams/h.jpg",
    order: 11,
    theme: { border: "#FCC700", primary: "#FCC700" },
  },
  {
    id: "E",
    shortName: "楽天",
    fullName: "東北楽天ゴールデンイーグルス",
    logo: "/teams/e.png",
    order: 12,
    theme: { border: "#870010", primary: "#870010" },
  },
];

export const TEAM_IDS = TEAMS.map((t) => t.id);
export const TEAM_META = Object.fromEntries(
  TEAMS.map((t) => [t.id, { shortName: t.shortName, fullName: t.fullName }])
) as Record<TeamId, { shortName: string; fullName: string }>;
export const TEAM_LOGO = Object.fromEntries(TEAMS.map((t) => [t.id, t.logo]));
export const TEAM_THEMES = Object.fromEntries(
  TEAMS.map((t) => [t.id, t.theme])
) as Record<TeamId, TeamTheme>;
export const TEAM_ORDER = Object.fromEntries(TEAMS.map((t) => [t.id, t.order]));

// 並び順キーを返す
export function gameSortKey(homeTeamId: string, awayTeamId: string) {
  const home = TEAM_ORDER[homeTeamId] ?? 9999;
  const away = TEAM_ORDER[awayTeamId] ?? 9999;
  return Math.min(home, away);
}
