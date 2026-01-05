import { BallParkId } from "../../scheduledGame/valueObjects/BallPark";

type BallParkWeatherPointItem = {
  prefectureName: string;
  municipalitiesName: string;
  latitude: number;
  longitude: number;
  nearestWeatherStationName: string;
};

export const BallParkWeatherPointCatalog: Partial<
  Record<BallParkId, BallParkWeatherPointItem>
> = {
  1: {
    prefectureName: "兵庫県",
    municipalitiesName: "西宮市",
    latitude: 34.72113,
    longitude: 135.361686,
    nearestWeatherStationName: "神戸",
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
    private readonly _nearestWeatherStationName: string
  ) {}

  static create(ballParkId: number): BallParkWeatherPoint {
    const hit = BallParkWeatherPointCatalog[ballParkId];
    if (!hit) throw new Error("球場付近の天気予報地点が見つかりません");
    this.validate(hit);

    return new BallParkWeatherPoint(
      hit.prefectureName,
      hit.municipalitiesName,
      hit.latitude,
      hit.longitude,
      hit.nearestWeatherStationName
    );
  }

  private static validate(
    ballParkWeatherPoint: BallParkWeatherPointItem
  ): void {
    if (
      ballParkWeatherPoint.latitude < -90 ||
      ballParkWeatherPoint.latitude > 90
    )
      throw new Error("緯度が範囲外です");
    if (
      ballParkWeatherPoint.longitude < -180 ||
      ballParkWeatherPoint.longitude > 180
    )
      throw new Error("経度が範囲外です");
    if (ballParkWeatherPoint.prefectureName.length > 100)
      throw new Error("都道府県名が長すぎます");
    if (ballParkWeatherPoint.municipalitiesName.length > 100)
      throw new Error("市区町村名が長すぎます");
    if (ballParkWeatherPoint.nearestWeatherStationName.length > 100)
      throw new Error("最寄りの気象台名が長すぎます");
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
}
