import { inflateSync } from "node:zlib";
import { InfrastructureError } from "../../../../shared/errors/InfrastructureError";

/** デコード結果。画素は RGBA の順に4バイトずつ並ぶ */
export interface DecodedImage {
  readonly width: number;
  readonly height: number;
  readonly rgba: Uint8Array;
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const COLOR_TYPE_INDEXED = 3;
const COLOR_TYPE_RGBA = 6;

/**
 * 気象庁のタイル画像をデコードする最小限のPNGデコーダ。
 *
 * 外部ライブラリを増やさないため自前で持つ。Nodeの zlib だけに依存する。
 * 気象庁のタイルで実際に観測される2形式のみ対応する:
 *
 *   - パレット画像 (colorType=3, bitDepth=4) … 降水域があるタイル
 *   - RGBA画像     (colorType=6, bitDepth=8) … 全面透過の空タイル
 *
 * どちらも扱えるよう、出力は RGBA に統一する。
 * 想定外の形式は黙って誤った値を返すより落とす方が安全なので例外にする。
 */
export class PngDecoder {
  static decodeToRgba(buffer: Uint8Array): DecodedImage {
    this.assertSignature(buffer);
    const chunks = this.readChunks(buffer);

    const header = chunks.get("IHDR");
    if (!header || header.length < 13) {
      throw new InfrastructureError("mapping", "PNGのIHDRが不正です");
    }

    const view = new DataView(
      header.buffer,
      header.byteOffset,
      header.byteLength,
    );
    const width = view.getUint32(0);
    const height = view.getUint32(4);
    const bitDepth = header[8];
    const colorType = header[9];
    const compression = header[10];
    const filter = header[11];
    const interlace = header[12];

    if (width === 0 || height === 0) {
      throw new InfrastructureError("mapping", "PNGの画像サイズが不正です", {
        details: { width, height },
      });
    }
    if (compression !== 0 || filter !== 0) {
      throw new InfrastructureError("mapping", "未対応のPNG圧縮方式です", {
        details: { compression, filter },
      });
    }
    // インターレースPNGは行の並びが異なり、そのまま読むと画像が崩れる
    if (interlace !== 0) {
      throw new InfrastructureError(
        "mapping",
        "インターレースPNGには対応していません",
        { details: { interlace } },
      );
    }

    const idat = chunks.get("IDAT");
    if (!idat) {
      throw new InfrastructureError("mapping", "PNGのIDATが見つかりません");
    }

    let raw: Uint8Array;
    try {
      raw = new Uint8Array(inflateSync(Buffer.from(idat)));
    } catch (err) {
      throw new InfrastructureError("mapping", "PNGの展開に失敗しました", {
        cause: err,
      });
    }

    if (colorType === COLOR_TYPE_INDEXED) {
      return this.decodeIndexed(raw, chunks, width, height, bitDepth);
    }
    if (colorType === COLOR_TYPE_RGBA && bitDepth === 8) {
      return this.decodeRgba8(raw, width, height);
    }

    throw new InfrastructureError("mapping", "未対応のPNG形式です", {
      details: { colorType, bitDepth },
    });
  }

  private static decodeIndexed(
    raw: Uint8Array,
    chunks: Map<string, Uint8Array>,
    width: number,
    height: number,
    bitDepth: number,
  ): DecodedImage {
    if (![1, 2, 4, 8].includes(bitDepth)) {
      throw new InfrastructureError(
        "mapping",
        "パレット画像のビット深度が未対応です",
        { details: { bitDepth } },
      );
    }

    const palette = chunks.get("PLTE");
    if (!palette || palette.length % 3 !== 0) {
      throw new InfrastructureError("mapping", "PNGのPLTEが不正です");
    }
    const paletteSize = palette.length / 3;

    // tRNS はパレットの先頭から順に不透明度を与える。
    // 記載のないインデックスは不透明として扱う(PNG仕様)。
    const transparency = chunks.get("tRNS");

    // ビット深度が8未満でもフィルタはバイト単位で働くため、フィルタ用の画素幅は1バイト
    const bytesPerRow = Math.ceil((width * bitDepth) / 8);
    const scanlines = this.unfilter(raw, bytesPerRow, height, 1);

    const rgba = new Uint8Array(width * height * 4);
    const pixelsPerByte = 8 / bitDepth;
    const mask = (1 << bitDepth) - 1;

    for (let y = 0; y < height; y++) {
      const row = scanlines.subarray(y * bytesPerRow, (y + 1) * bytesPerRow);
      for (let x = 0; x < width; x++) {
        const byte = row[Math.floor(x / pixelsPerByte)];
        const shift = 8 - bitDepth * ((x % pixelsPerByte) + 1);
        const index = (byte >> shift) & mask;

        const out = (y * width + x) * 4;
        if (index >= paletteSize) {
          // パレット外のインデックスは壊れたデータなので透明扱いにする
          rgba[out + 3] = 0;
          continue;
        }
        rgba[out] = palette[index * 3];
        rgba[out + 1] = palette[index * 3 + 1];
        rgba[out + 2] = palette[index * 3 + 2];
        rgba[out + 3] =
          transparency && index < transparency.length
            ? transparency[index]
            : 255;
      }
    }

    return { width, height, rgba };
  }

  private static decodeRgba8(
    raw: Uint8Array,
    width: number,
    height: number,
  ): DecodedImage {
    const bytesPerPixel = 4;
    const bytesPerRow = width * bytesPerPixel;
    const scanlines = this.unfilter(raw, bytesPerRow, height, bytesPerPixel);
    return { width, height, rgba: scanlines };
  }

  /**
   * PNGの行フィルタを解除する。
   * 各行の先頭1バイトがフィルタ種別で、直前の画素(left)と直上の行(up)を使って復元する。
   */
  private static unfilter(
    raw: Uint8Array,
    bytesPerRow: number,
    height: number,
    bytesPerPixel: number,
  ): Uint8Array {
    const expected = (bytesPerRow + 1) * height;
    if (raw.length < expected) {
      throw new InfrastructureError(
        "mapping",
        "PNGの展開後データが不足しています",
        { details: { expected, actual: raw.length } },
      );
    }

    const out = new Uint8Array(bytesPerRow * height);
    let cursor = 0;

    for (let y = 0; y < height; y++) {
      const filterType = raw[cursor++];
      const line = raw.subarray(cursor, cursor + bytesPerRow);
      cursor += bytesPerRow;

      const rowStart = y * bytesPerRow;
      const prevStart = rowStart - bytesPerRow;

      for (let i = 0; i < bytesPerRow; i++) {
        const left = i >= bytesPerPixel ? out[rowStart + i - bytesPerPixel] : 0;
        const up = y > 0 ? out[prevStart + i] : 0;
        const upLeft =
          y > 0 && i >= bytesPerPixel ? out[prevStart + i - bytesPerPixel] : 0;

        let value: number;
        switch (filterType) {
          case 0:
            value = line[i];
            break;
          case 1:
            value = line[i] + left;
            break;
          case 2:
            value = line[i] + up;
            break;
          case 3:
            value = line[i] + ((left + up) >> 1);
            break;
          case 4:
            value = line[i] + this.paeth(left, up, upLeft);
            break;
          default:
            throw new InfrastructureError(
              "mapping",
              "未知のPNGフィルタ種別です",
              { details: { filterType, row: y } },
            );
        }
        out[rowStart + i] = value & 0xff;
      }
    }

    return out;
  }

  /** Paeth予測子。左・上・左上のうち予測値に最も近いものを選ぶ */
  private static paeth(left: number, up: number, upLeft: number): number {
    const estimate = left + up - upLeft;
    const distLeft = Math.abs(estimate - left);
    const distUp = Math.abs(estimate - up);
    const distUpLeft = Math.abs(estimate - upLeft);
    if (distLeft <= distUp && distLeft <= distUpLeft) return left;
    if (distUp <= distUpLeft) return up;
    return upLeft;
  }

  private static assertSignature(buffer: Uint8Array): void {
    if (buffer.length < PNG_SIGNATURE.length) {
      throw new InfrastructureError("mapping", "PNGとして短すぎます", {
        details: { length: buffer.length },
      });
    }
    for (let i = 0; i < PNG_SIGNATURE.length; i++) {
      if (buffer[i] !== PNG_SIGNATURE[i]) {
        throw new InfrastructureError("mapping", "PNGのシグネチャが不正です");
      }
    }
  }

  /**
   * チャンクを種別ごとに集める。
   * IDATは複数に分割されることがあるので連結する。
   */
  private static readChunks(buffer: Uint8Array): Map<string, Uint8Array> {
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );
    const parts = new Map<string, Uint8Array[]>();

    let cursor = PNG_SIGNATURE.length;
    while (cursor + 8 <= buffer.length) {
      const length = view.getUint32(cursor);
      const type = String.fromCharCode(
        buffer[cursor + 4],
        buffer[cursor + 5],
        buffer[cursor + 6],
        buffer[cursor + 7],
      );
      const dataStart = cursor + 8;
      const dataEnd = dataStart + length;
      if (dataEnd > buffer.length) {
        throw new InfrastructureError("mapping", "PNGチャンクが途中で切れています", {
          details: { type, length },
        });
      }

      const bucket = parts.get(type) ?? [];
      bucket.push(buffer.subarray(dataStart, dataEnd));
      parts.set(type, bucket);

      if (type === "IEND") break;
      cursor = dataEnd + 4; // CRC の4バイトを読み飛ばす
    }

    const merged = new Map<string, Uint8Array>();
    for (const [type, bucket] of parts) {
      if (bucket.length === 1) {
        merged.set(type, bucket[0]);
        continue;
      }
      const total = bucket.reduce((sum, part) => sum + part.length, 0);
      const joined = new Uint8Array(total);
      let offset = 0;
      for (const part of bucket) {
        joined.set(part, offset);
        offset += part.length;
      }
      merged.set(type, joined);
    }
    return merged;
  }
}
