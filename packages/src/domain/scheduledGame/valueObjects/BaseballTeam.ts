import { DomainError } from "../../../shared/errors/DomainError";
import { ensureTextPresent } from "../../shared/utils/ensurePresent";
import { BallParkCatalog, BallParkId } from "./BallPark";

export const TeamCatalog = {
  YS: {
    nameJa: "東京ヤクルトスワローズ",
    homeBallParkId: [BallParkCatalog.MEIJI_JINGU_STADIUM.id],
  },
  YG: {
    nameJa: "読売ジャイアンツ",
    homeBallParkId: [BallParkCatalog.TOKYO_DOME.id],
  },
  HT: {
    nameJa: "阪神タイガース",
    homeBallParkId: [BallParkCatalog.HANSHIN_KOSHIEN_STADIUM.id],
  },
  C: {
    nameJa: "広島東洋カープ",
    homeBallParkId: [BallParkCatalog.MAZDA_STADIUM_HIROSHIMA.id],
  },
  D: {
    nameJa: "中日ドラゴンズ",
    homeBallParkId: [BallParkCatalog.VANTELIN_DOME_NAGOYA.id],
  },
  DB: {
    nameJa: "横浜DeNAベイスターズ",
    homeBallParkId: [BallParkCatalog.YOKOHAMA_STADIUM.id],
  },
  F: {
    nameJa: "北海道日本ハムファイターズ",
    homeBallParkId: [BallParkCatalog.ES_CON_FIELD_HOKKAIDO.id],
  },
  M: {
    nameJa: "千葉ロッテマリーンズ",
    homeBallParkId: [BallParkCatalog.ZOZO_MARINE_STADIUM.id],
  },
  B: {
    nameJa: "オリックスバファローズ",
    homeBallParkId: [BallParkCatalog.KYOCERA_DOME_OSAKA.id],
  },
  L: {
    nameJa: "埼玉西武ライオンズ",
    homeBallParkId: [BallParkCatalog.BELLUNA_DOME.id],
  },
  H: {
    nameJa: "福岡ソフトバンクホークス",
    homeBallParkId: [BallParkCatalog.FUKUOKA_PAY_PAY_DOME.id],
  },
  E: {
    nameJa: "東北楽天ゴールデンイーグルス",
    homeBallParkId: [BallParkCatalog.RAKUTEN_MOBILE_PARK_MIYAGI.id],
  },
} as const;

export type TeamId = keyof typeof TeamCatalog;

// export const BaseballTeamType = [
//   "東京ヤクルトスワローズ",
//   "読売ジャイアンツ",
//   "阪神タイガース",
//   "広島東洋カープ",
//   "中日ドラゴンズ",
//   "横浜DeNAベイスターズ",
//   "北海道日本ハムファイターズ",
//   "千葉ロッテマリーンズ",
//   "オリックスバファローズ",
//   "埼玉西武ライオンズ",
//   "福岡ソフトバンクホークス",
//   "東北楽天ゴールデンイーグルス",
// ] as const;

// export type BaseballTeamType = (typeof BaseballTeamType)[number];
// export type UnknownTeam = string & { readonly __brand?: "UnknownTeam" };
// export type AnyTeamName = BaseballTeamType | UnknownTeam;
export class BaseballTeam {
  private constructor(readonly value: TeamId) {}

  static from(rawValue: string): BaseballTeam {
    const id = ensureTextPresent("チームID", rawValue) as TeamId;
    if (!TeamCatalog[id]) throw new DomainError("不正なチームIDです", { id });
    return new BaseballTeam(id);
  }

  static fromName(rawName: string): BaseballTeam {
    const name = ensureTextPresent("チーム名", rawName);
    const hit = Object.entries(TeamCatalog).find(([, v]) => v.nameJa === name);
    if (!hit) throw new DomainError("不正なチーム名です", { name });
    return new BaseballTeam(hit[0] as TeamId);
  }

  id(): TeamId {
    return this.value;
  }

  labelJa(): string {
    return TeamCatalog[this.value].nameJa;
  }

  homeBallParkIds(): BallParkId[] {
    return [...TeamCatalog[this.value].homeBallParkId];
  }
}
