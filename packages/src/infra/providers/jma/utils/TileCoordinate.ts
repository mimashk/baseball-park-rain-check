import { ValidationError } from "../../../../shared/errors/ValidationError";

/** 地図タイル1枚の一辺のピクセル数 */
export const TILE_SIZE = 256;

/** 世界全体を1枚の画像とみなしたときのピクセル座標 */
export interface GlobalPixel {
  readonly x: number;
  readonly y: number;
}

/** タイルの番号 */
export interface TileIndex {
  readonly x: number;
  readonly y: number;
}

/** タイル内のどのピクセルかを表す位置 */
export interface TilePixel {
  readonly tile: TileIndex;
  readonly offsetX: number;
  readonly offsetY: number;
}

/**
 * Webメルカトル図法のタイル座標を扱う。
 *
 * 球場周辺を平均する際、窓がタイルの境界をまたぐことがある。
 * タイル内の座標で計算すると境界で切れてしまうため、
 * いったん「世界全体のピクセル座標」に直してから窓を取り、
 * 必要なタイルを後から逆算する方針をとる。
 */
export class TileCoordinate {
  /** 緯度経度を世界全体のピクセル座標に変換する */
  static toGlobalPixel(
    latitude: number,
    longitude: number,
    zoom: number,
  ): GlobalPixel {
    this.assertZoom(zoom);
    if (!Number.isFinite(latitude) || latitude < -85.05112878 || latitude > 85.05112878) {
      throw new ValidationError("緯度がWebメルカトルの範囲外です", { latitude });
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new ValidationError("経度が範囲外です", { longitude });
    }

    const worldSize = this.worldSize(zoom);
    const latRad = (latitude * Math.PI) / 180;

    const x = ((longitude + 180) / 360) * worldSize;
    const y =
      ((1 -
        Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) /
        2) *
      worldSize;

    return { x, y };
  }

  /** 世界全体のピクセル座標が、どのタイルのどの位置にあたるかを求める */
  static toTilePixel(pixel: GlobalPixel, zoom: number): TilePixel {
    this.assertZoom(zoom);
    const tileX = Math.floor(pixel.x / TILE_SIZE);
    const tileY = Math.floor(pixel.y / TILE_SIZE);
    return {
      tile: { x: tileX, y: tileY },
      offsetX: Math.floor(pixel.x) - tileX * TILE_SIZE,
      offsetY: Math.floor(pixel.y) - tileY * TILE_SIZE,
    };
  }

  /**
   * 中心から半径 radiusPixels の正方形の窓が覆うタイルをすべて列挙する。
   *
   * 窓が境界をまたがなければ1枚、辺をまたげば2枚、角をまたげば4枚になる。
   * 経度方向の折り返しは日本では発生しないため、範囲外は切り詰めるだけにしている。
   */
  static tilesCoveringWindow(
    center: GlobalPixel,
    radiusPixels: number,
    zoom: number,
  ): TileIndex[] {
    this.assertZoom(zoom);
    if (!Number.isInteger(radiusPixels) || radiusPixels < 0) {
      throw new ValidationError("窓の半径は0以上の整数で指定してください", {
        radiusPixels,
      });
    }

    const maxIndex = 2 ** zoom - 1;
    const clamp = (v: number) => Math.min(maxIndex, Math.max(0, v));

    const minTileX = clamp(Math.floor((center.x - radiusPixels) / TILE_SIZE));
    const maxTileX = clamp(Math.floor((center.x + radiusPixels) / TILE_SIZE));
    const minTileY = clamp(Math.floor((center.y - radiusPixels) / TILE_SIZE));
    const maxTileY = clamp(Math.floor((center.y + radiusPixels) / TILE_SIZE));

    const tiles: TileIndex[] = [];
    for (let y = minTileY; y <= maxTileY; y++) {
      for (let x = minTileX; x <= maxTileX; x++) {
        tiles.push({ x, y });
      }
    }
    return tiles;
  }

  /** 指定した緯度・ズームでの1ピクセルあたりの距離(メートル) */
  static metersPerPixel(latitude: number, zoom: number): number {
    this.assertZoom(zoom);
    const equatorMetersPerPixel = 156543.03392804097;
    return (
      (equatorMetersPerPixel * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom
    );
  }

  /**
   * 半径を距離(km)からピクセル数に直す。
   * 空間平均の範囲を「5km角」のように距離で指定できるようにするため。
   */
  static radiusPixelsForKilometers(
    kilometers: number,
    latitude: number,
    zoom: number,
  ): number {
    if (!Number.isFinite(kilometers) || kilometers < 0) {
      throw new ValidationError("半径は0以上で指定してください", { kilometers });
    }
    const metersPerPixel = this.metersPerPixel(latitude, zoom);
    return Math.max(0, Math.round((kilometers * 1000) / metersPerPixel));
  }

  private static worldSize(zoom: number): number {
    return TILE_SIZE * 2 ** zoom;
  }

  private static assertZoom(zoom: number): void {
    if (!Number.isInteger(zoom) || zoom < 0 || zoom > 20) {
      throw new ValidationError("ズームレベルが不正です", { zoom });
    }
  }
}
