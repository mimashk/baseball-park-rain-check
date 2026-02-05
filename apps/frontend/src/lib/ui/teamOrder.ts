export const TEAM_ORDER: Record<string, number> = {
  // セリーグ
  YS: 1,
  YG: 2,
  HT: 3,
  C: 4,
  D: 5,
  DB: 6,
  // パリーグ
  F: 101,
  M: 102,
  B: 103,
  L: 104,
  H: 105,
  E: 106,
};

// 並び順キーを返す
export function gameSortKey(homeTeamId: string, awayTeamId: string) {
  const home = TEAM_ORDER[homeTeamId] ?? 9999;
  const away = TEAM_ORDER[awayTeamId] ?? 9999;
  return Math.min(home, away);
}
