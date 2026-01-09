export const BallParkCatalog = {
  TOKYO_DOME: { id: 1, labelJa: "東京ドーム", roof: "DOME" },
  HANSHIN_KOSHIEN_STADIUM: {
    id: 2,
    labelJa: "阪神甲子園球場",
    roof: "OPEN_AIR",
  },
  YOKOHAMA_STADIUM: { id: 3, labelJa: "横浜スタジアム", roof: "OPEN_AIR" },
  VANTELIN_DOME_NAGOYA: {
    id: 4,
    labelJa: "バンテリンドーム ナゴヤ",
    roof: "DOME",
  },
  MEIJI_JINGU_STADIUM: { id: 5, labelJa: "明治神宮野球場", roof: "OPEN_AIR" },
  MAZDA_STADIUM_HIROSHIMA: {
    id: 6,
    labelJa: "MAZDA Zoom-Zoom スタジアム広島",
    roof: "OPEN_AIR",
  },
  ES_CON_FIELD_HOKKAIDO: {
    id: 7,
    labelJa: "エスコンフィールド北海道",
    roof: "DOME",
  },
  RAKUTEN_MOBILE_PARK_MIYAGI: {
    id: 8,
    labelJa: "楽天モバイルパーク宮城",
    roof: "OPEN_AIR",
  },
  BELLUNA_DOME: { id: 9, labelJa: "ベルーナドーム", roof: "DOME" },
  ZOZO_MARINE_STADIUM: {
    id: 10,
    labelJa: "ZOZOマリンスタジアム",
    roof: "OPEN_AIR",
  },
  KYOCERA_DOME_OSAKA: { id: 11, labelJa: "京セラドーム大阪", roof: "DOME" },
  FUKUOKA_PAY_PAY_DOME: { id: 12, labelJa: "福岡PayPayドーム", roof: "DOME" },
} as const;

export type BallParkId =
  | (typeof BallParkCatalog)[keyof typeof BallParkCatalog]["id"]
  | 0;

type BallParkCatalogItem =
  (typeof BallParkCatalog)[keyof typeof BallParkCatalog];

type BallParkRoofType = "OPEN_AIR" | "DOME" | "UNKNOWN";

export class BallPark {
  private constructor(
    private readonly _id: BallParkId,
    private readonly _name: string,
    private readonly _roof: BallParkRoofType
  ) {}

  /** 唯一の生成口：呼び出し側は known/unknown を意識しない */
  static fromString(rawName: string): BallPark {
    const name = this.normalize(rawName);
    this.validate(name);

    const hit = this.findInCatalog(name);
    if (hit) {
      // 既知球場：表記をカタログ表記に寄せる（表記ゆれ吸収）
      return new BallPark(hit.id, hit.labelJa, hit.roof);
    }

    // 未知球場：最低限通して UNKNOWN 扱い
    return new BallPark(0, name, "UNKNOWN");
  }

  static fromId(id: BallParkId): BallPark {
    const hit = Object.values(BallParkCatalog).find((item) => item.id === id);
    if (hit) {
      return new BallPark(hit.id, hit.labelJa, hit.roof);
    }
    return new BallPark(0, "", "UNKNOWN");
  }

  private static normalize(name: string): string {
    return name.trim().replace(/\s+/g, " ");
  }

  private static validate(name: string): void {
    if (name.length === 0) throw new Error("球場名が空です");
    if (name.length > 80) throw new Error("球場名が長すぎます");
    if (/[\u0000-\u001F\u007F]/.test(name))
      throw new Error("球場名に不正な文字が含まれています");
  }

  private static findInCatalog(name: string): BallParkCatalogItem | null {
    // まず完全一致（正規化後）
    for (const item of Object.values(BallParkCatalog)) {
      if (item.labelJa === name) return item;
    }
    return null;
  }

  id(): BallParkId {
    return this._id;
  }

  name(): string {
    return this._name;
  }

  roof(): BallParkRoofType {
    return this._roof;
  }

  isOpenAir(): boolean {
    return this._roof === "OPEN_AIR";
  }
}
