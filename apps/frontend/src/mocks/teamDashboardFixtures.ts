import { TeamId } from "@/types/TeamId";
import { Weather } from "@/types/Weather";

export type TeamMeta = {
  id: TeamId;
  name: string;
  ballpark: string;
  isOpenAir: boolean;
};

export type WeeklyPattern = {
  gameDays: number[]; // 0-6
  weatherCycle: Weather[];
  highBase: number;
  lowBase: number;
};

export type DailyMatchup = {
  dateJst: string;
  home: TeamId;
  away: TeamId;
  ballpark: string;
};

const WEATHER_LIBRARY = {
  clear: {
    text: "晴れ",
    wmoCode: 0,
    temperatureC: 18,
    precipProbPct: 10,
    precipMm: 0,
  },
  cloudy: {
    text: "くもり",
    wmoCode: 3,
    temperatureC: 14,
    precipProbPct: 20,
    precipMm: 0,
  },
  lightRain: {
    text: "弱い雨",
    wmoCode: 61,
    temperatureC: 12,
    precipProbPct: 60,
    precipMm: 1.2,
  },
  showers: {
    text: "にわか雨",
    wmoCode: 80,
    temperatureC: 13,
    precipProbPct: 50,
    precipMm: 0.8,
  },
  heavyRain: {
    text: "強い雨",
    wmoCode: 65,
    temperatureC: 11,
    precipProbPct: 80,
    precipMm: 4.5,
  },
} as const;

export const TEAM_META: Record<TeamId, TeamMeta> = {
  HT: { id: "HT", name: "阪神", ballpark: "阪神甲子園球場", isOpenAir: true },
  YG: { id: "YG", name: "巨人", ballpark: "東京ドーム", isOpenAir: false },
  YS: {
    id: "YS",
    name: "ヤクルト",
    ballpark: "明治神宮野球場",
    isOpenAir: true,
  },
  C: { id: "C", name: "広島", ballpark: "MAZDAスタジアム", isOpenAir: true },
  D: { id: "D", name: "中日", ballpark: "バンテリンドーム", isOpenAir: false },
  DB: { id: "DB", name: "DeNA", ballpark: "横浜スタジアム", isOpenAir: true },
  F: {
    id: "F",
    name: "日本ハム",
    ballpark: "エスコンフィールド",
    isOpenAir: false,
  },
  M: { id: "M", name: "ロッテ", ballpark: "ZOZOマリン", isOpenAir: true },
  B: {
    id: "B",
    name: "オリックス",
    ballpark: "京セラドーム",
    isOpenAir: false,
  },
  L: { id: "L", name: "西武", ballpark: "ベルーナドーム", isOpenAir: false },
  H: {
    id: "H",
    name: "ソフトバンク",
    ballpark: "みずほPayPayドーム",
    isOpenAir: false,
  },
  E: { id: "E", name: "楽天", ballpark: "楽天モバイルパーク", isOpenAir: true },
};

export const TEAM_WEATHER_BASE: Record<TeamId, Weather> = {
  HT: WEATHER_LIBRARY.lightRain,
  YG: WEATHER_LIBRARY.clear,
  YS: WEATHER_LIBRARY.cloudy,
  C: WEATHER_LIBRARY.showers,
  D: WEATHER_LIBRARY.clear,
  DB: WEATHER_LIBRARY.cloudy,
  F: WEATHER_LIBRARY.clear,
  M: WEATHER_LIBRARY.lightRain,
  B: WEATHER_LIBRARY.cloudy,
  L: WEATHER_LIBRARY.showers,
  H: WEATHER_LIBRARY.clear,
  E: WEATHER_LIBRARY.heavyRain,
};

const TEAM_ORDER: TeamId[] = [
  "HT",
  "YG",
  "YS",
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

const BASE_GAME_DAYS = [0, 2, 4, 6];
const BASE_WEATHER_CYCLE: Weather[] = [
  WEATHER_LIBRARY.clear,
  WEATHER_LIBRARY.cloudy,
  WEATHER_LIBRARY.lightRain,
  WEATHER_LIBRARY.showers,
  WEATHER_LIBRARY.clear,
  WEATHER_LIBRARY.cloudy,
  WEATHER_LIBRARY.heavyRain,
];

function shiftArray<T>(arr: T[], shift: number): T[] {
  const s = ((shift % arr.length) + arr.length) % arr.length;
  return arr.slice(s).concat(arr.slice(0, s));
}

function cloneWeather(w: Weather): Weather {
  return { ...w };
}

export function getWeeklyPattern(teamId: TeamId): WeeklyPattern {
  const idx = TEAM_ORDER.indexOf(teamId);
  const shift = idx < 0 ? 0 : idx % 3;

  return {
    gameDays: shiftArray(BASE_GAME_DAYS, shift),
    weatherCycle: shiftArray(BASE_WEATHER_CYCLE, shift).map(cloneWeather),
    highBase: 12 + shift,
    lowBase: 4 + shift,
  };
}

/**
 * 日付ごとに「1つのカード + 1つの球場」に固定したスケジュール
 * (どの teamId から見ても同日のカード/球場は同一)
 */
export function buildDailySchedule(dateJst: string): DailyMatchup[] {
  const date = new Date(`${dateJst}T00:00:00+09:00`);

  // 日曜(0)は全球団 試合なし
  if (date.getDay() === 0) {
    return [];
  }

  const rotate = date.getDate() % TEAM_ORDER.length;
  const pick = (i: number) => TEAM_ORDER[(rotate + i) % TEAM_ORDER.length];

  // 1日6カード = 12球団全て試合あり
  const pairs: Array<[TeamId, TeamId]> = [
    [pick(0), pick(1)],
    [pick(2), pick(3)],
    [pick(4), pick(5)],
    [pick(6), pick(7)],
    [pick(8), pick(9)],
    [pick(10), pick(11)],
  ];

  return pairs.map(([home, away]) => ({
    dateJst,
    home,
    away,
    ballpark: TEAM_META[home].ballpark,
  }));
}

export function getMatchupForTeam(
  dateJst: string,
  teamId: TeamId
): DailyMatchup | null {
  const schedule = buildDailySchedule(dateJst);
  return schedule.find((m) => m.home === teamId || m.away === teamId) ?? null;
}

export function getTeamScenario(teamId: string) {
  const id = (teamId in TEAM_META ? (teamId as TeamId) : "HT") as TeamId;
  const weatherBase = cloneWeather(TEAM_WEATHER_BASE[id]);
  const weeklyPattern = getWeeklyPattern(id);

  return { id, weatherBase, weeklyPattern };
}
