import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { BallParkId } from "../../scheduledGame/valueObjects/BallPark";

type BallParkWeatherPointItem = {
  prefectureName: string;
  municipalitiesName: string;
  latitude: number;
  longitude: number;
  /** 最寄りのアメダス観測所名。表示用 */
  nearestWeatherStationName: string;
  /**
   * 最寄りのアメダス観測所番号。実況降水量の取得に使う。
   * アメダスのAPIは名前ではなく番号で引くため、名前とは別に持つ。
   * 全国1,286局のうち1,285局が降水量を観測しているので、
   * 単純に最寄りを選んでよい(気温・風は915局のみなので同じ選び方はできない)。
   */
  amedasStationId: string;
};

export const BallParkWeatherPointCatalog: Partial<
  Record<BallParkId, BallParkWeatherPointItem>
> = {
  2: {
    prefectureName: "兵庫県",
    municipalitiesName: "西宮市",
    latitude: 34.72113,
    longitude: 135.361686,
    nearestWeatherStationName: "西宮",
    amedasStationId: "63477",
  },  3: {
    prefectureName: "神奈川県",
    municipalitiesName: "横浜市",
    latitude: 35.443565,
    longitude: 139.6402,
    nearestWeatherStationName: "横浜",
    amedasStationId: "46106",
  },  4: {
    prefectureName: "愛知県",
    municipalitiesName: "名古屋市",
    latitude: 35.1859476,
    longitude: 136.9474047,
    nearestWeatherStationName: "名古屋",
    amedasStationId: "51106",
  },  5: {
    prefectureName: "東京都",
    municipalitiesName: "新宿区",
    latitude: 35.674554,
    longitude: 139.717122,
    nearestWeatherStationName: "東京",
    amedasStationId: "44132",
  },  6: {
    prefectureName: "広島県",
    municipalitiesName: "広島市",
    latitude: 34.39147,
    longitude: 132.484629,
    nearestWeatherStationName: "広島",
    amedasStationId: "67437",
  },  7: {
    prefectureName: "北海道",
    municipalitiesName: "札幌市",
    latitude: 42.9899332,
    longitude: 141.5498153,
    nearestWeatherStationName: "恵庭島松",
    amedasStationId: "14206",
  },  8: {
    prefectureName: "宮城県",
    municipalitiesName: "仙台市",
    latitude: 38.257271,
    longitude: 140.902672,
    nearestWeatherStationName: "仙台",
    amedasStationId: "34392",
  },  9: {
    prefectureName: "埼玉県",
    municipalitiesName: "所沢市",
    latitude: 35.768462,
    longitude: 139.420553,
    nearestWeatherStationName: "所沢",
    amedasStationId: "43266",
  },  10: {
    prefectureName: "千葉県",
    municipalitiesName: "千葉市",
    latitude: 35.645294,
    longitude: 140.030909,
    nearestWeatherStationName: "船橋",
    amedasStationId: "45106",
  },  11: {
    prefectureName: "大阪府",
    municipalitiesName: "大阪市",
    latitude: 34.6692668,
    longitude: 135.4760877,
    nearestWeatherStationName: "大阪",
    amedasStationId: "62078",
  },  12: {
    prefectureName: "福岡県",
    municipalitiesName: "福岡市",
    latitude: 33.595285,
    longitude: 130.362064,
    nearestWeatherStationName: "福岡",
    amedasStationId: "82182",
  },
} as const;

export type BallParkWeatherPointCatalogItem =
  (typeof BallParkWeatherPointCatalog)[keyof typeof BallParkWeatherPointCatalog];

export class BallParkWeatherPoint {
  private constructor(
    private readonly _prefectureName: string,
    private readonly _municipalitiesName: string,
    private readonly _latitude: number,
    private readonly _longitude: number,
    private readonly _nearestWeatherStationName: string,
    private readonly _amedasStationId: string
  ) {}

  static create(ballParkId: BallParkId): BallParkWeatherPoint {
    const hit = BallParkWeatherPointCatalog[ballParkId];
    if (!hit)
      throw new DomainError("球場付近の天気予報地点が見つかりません", {
        ballParkId,
      });
    this.validate(hit);

    return new BallParkWeatherPoint(
      hit.prefectureName,
      hit.municipalitiesName,
      hit.latitude,
      hit.longitude,
      hit.nearestWeatherStationName,
      hit.amedasStationId
    );
  }

  private static validate(
    ballParkWeatherPoint: BallParkWeatherPointItem
  ): void {
    if (
      ballParkWeatherPoint.latitude < -90 ||
      ballParkWeatherPoint.latitude > 90
    )
      throw new ValidationError("緯度が範囲外です", {
        latitude: ballParkWeatherPoint.latitude,
      });
    if (
      ballParkWeatherPoint.longitude < -180 ||
      ballParkWeatherPoint.longitude > 180
    )
      throw new ValidationError("経度が範囲外です", {
        longitude: ballParkWeatherPoint.longitude,
      });
    if (ballParkWeatherPoint.prefectureName.length > 100)
      throw new ValidationError("都道府県名が長すぎます", {
        length: ballParkWeatherPoint.prefectureName.length,
      });
    if (ballParkWeatherPoint.municipalitiesName.length > 100)
      throw new ValidationError("市区町村名が長すぎます", {
        length: ballParkWeatherPoint.municipalitiesName.length,
      });
    if (ballParkWeatherPoint.nearestWeatherStationName.length > 100)
      throw new ValidationError("最寄りの気象台名が長すぎます", {
        length: ballParkWeatherPoint.nearestWeatherStationName.length,
      });
    if (!/^\d{5}$/.test(ballParkWeatherPoint.amedasStationId))
      throw new ValidationError("アメダス観測所番号は5桁の数字です", {
        amedasStationId: ballParkWeatherPoint.amedasStationId,
      });
  }

  prefectureName(): string {
    return this._prefectureName;
  }

  municipalitiesName(): string {
    return this._municipalitiesName;
  }

  latitude(): number {
    return this._latitude;
  }

  longitude(): number {
    return this._longitude;
  }

  nearestWeatherStationName(): string {
    return this._nearestWeatherStationName;
  }

  amedasStationId(): string {
    return this._amedasStationId;
  }
}
