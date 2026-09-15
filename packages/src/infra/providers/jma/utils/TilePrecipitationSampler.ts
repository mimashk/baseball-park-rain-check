import { ValidationError } from "../../../../shared/errors/ValidationError";
import { DecodedImage } from "../decoders/PngDecoder";
import { PrecipitationColorScale } from "../decoders/PrecipitationColorScale";
import { GlobalPixel, TILE_SIZE, TileIndex } from "./TileCoordinate";

/** タイル番号をキーにデコード済み画像を引くための形 */
export type DecodedTileMap = ReadonlyMap<string, DecodedImage>;

export interface SampleResult {
  /** 窓内の平均降水量(mm)。階級の量子化を平均で均すのが狙い */
  readonly meanMm: number;
  /** 中心1ピクセルの降水量(mm)。窓が使えない場合は null */
  readonly centerMm: number | null;
  /** 値を読めた画素数 */
  readonly sampleCount: number;
  /** 既知のどの階級色にも一致しなかった画素数 */
  readonly unknownCount: number;
  /** タイルが無いなどで読めなかった画素数 */
  readonly missingCount: number;
  /** 窓内で降水ありと判定された画素の割合 */
  readonly rainyRatio: number;
}

/**
 * デコード済みタイルから、球場周辺の降水量を取り出す。
 *
 * ■ なぜ空間平均するか
 * タイルの値は8階級に量子化されているため、1画素だけ見ると 3.0mm のような
 * 飛び飛びの値しか得られない。複数画素を平均すると中間の値が復元でき、
 * 実測でも点の 7.5mm に対して5km角平均で 9.98mm と中間値が出ている。
 * 加えて学習に使った ERA5 は25kmグリッドの平均値なので、
 * 点の値より数km角の平均の方が学習時の性質に近い。
 *
 * ■ centerMm を別に返す理由
 * 空間平均は微小な値を窓内に残すため、`rainOccurRate`(> 0 で判定)を
 * 1 に向かって押し上げてしまう。5km角に1画素でも降水があれば平均は 0 より大きくなり、
 * 球場では実質降っていないのに「雨あり」と数えられる。
 * どちらを使うかは特徴量ごとに選べるよう、平均と中心値の両方を返す。
 */
export class TilePrecipitationSampler {
  /** タイル番号から地図の一意なキーを作る */
  static tileKey(tile: TileIndex): string {
    return `${tile.x}/${tile.y}`;
  }

  static sample(
    tiles: DecodedTileMap,
    center: GlobalPixel,
    radiusPixels: number,
  ): SampleResult {
    if (!Number.isInteger(radiusPixels) || radiusPixels < 0) {
      throw new ValidationError("窓の半径は0以上の整数で指定してください", {
        radiusPixels,
      });
    }

    const centerX = Math.floor(center.x);
    const centerY = Math.floor(center.y);

    let total = 0;
    let sampleCount = 0;
    let unknownCount = 0;
    let missingCount = 0;
    let rainyCount = 0;
    let centerMm: number | null = null;

    for (let dy = -radiusPixels; dy <= radiusPixels; dy++) {
      for (let dx = -radiusPixels; dx <= radiusPixels; dx++) {
        const globalX = centerX + dx;
        const globalY = centerY + dy;
        const value = this.readPixel(tiles, globalX, globalY);

        if (value === undefined) {
          missingCount++;
          continue;
        }
        if (value === null) {
          unknownCount++;
          continue;
        }

        total += value;
        sampleCount++;
        if (value > 0) rainyCount++;
        if (dx === 0 && dy === 0) centerMm = value;
      }
    }

    if (sampleCount === 0) {
      throw new ValidationError("窓内に読み取れた画素がありません", {
        radiusPixels,
        unknownCount,
        missingCount,
      });
    }

    return {
      meanMm: total / sampleCount,
      centerMm,
      sampleCount,
      unknownCount,
      missingCount,
      rainyRatio: rainyCount / sampleCount,
    };
  }

  /**
   * 世界全体のピクセル座標から1画素読む。
   *
   * 戻り値の意味:
   *   number    … 降水量(mm)
   *   null      … 既知の階級色に一致しない
   *   undefined … 該当するタイルが手元に無い
   */
  private static readPixel(
    tiles: DecodedTileMap,
    globalX: number,
    globalY: number,
  ): number | null | undefined {
    const tileX = Math.floor(globalX / TILE_SIZE);
    const tileY = Math.floor(globalY / TILE_SIZE);
    const image = tiles.get(this.tileKey({ x: tileX, y: tileY }));
    if (!image) return undefined;

    const offsetX = globalX - tileX * TILE_SIZE;
    const offsetY = globalY - tileY * TILE_SIZE;
    if (
      offsetX < 0 ||
      offsetY < 0 ||
      offsetX >= image.width ||
      offsetY >= image.height
    ) {
      return undefined;
    }

    const at = (offsetY * image.width + offsetX) * 4;
    return PrecipitationColorScale.toMillimeters(
      image.rgba[at],
      image.rgba[at + 1],
      image.rgba[at + 2],
      image.rgba[at + 3],
    );
  }
}
