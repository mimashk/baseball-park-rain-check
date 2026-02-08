import { TeamId } from "@/types/TeamId";

export const TEAM_META: Record<TeamId, { name: string }> = {
  HT: { name: "阪神" },
  YG: { name: "巨人" },
  YS: { name: "ヤクルト" },
  C: { name: "広島" },
  D: { name: "中日" },
  DB: { name: "DeNA" },
  F: { name: "日本ハム" },
  M: { name: "ロッテ" },
  B: { name: "オリックス" },
  L: { name: "西武" },
  H: { name: "ソフトバンク" },
  E: { name: "楽天" },
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
