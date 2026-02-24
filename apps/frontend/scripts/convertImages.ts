import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "public");
const TARGET_DIRS = ["teams", "share", "logo"]; // 必要に応じて追加
const RASTER_EXT = new Set([".png", ".jpg", ".jpeg"]);

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : [p];
    })
  );
  return files.flat();
}

async function ensureDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function convertOne(src: string) {
  const ext = path.extname(src).toLowerCase();
  if (!RASTER_EXT.has(ext)) return;

  const base = src.slice(0, -ext.length);
  const webpOut = `${base}.webp`;

  await ensureDir(webpOut);
  await sharp(src).webp({ quality: 82 }).toFile(webpOut);

  console.log(`converted: ${path.relative(ROOT, src)}`);
}

async function main() {
  for (const rel of TARGET_DIRS) {
    const dir = path.join(ROOT, rel);
    try {
      const files = await walk(dir);
      for (const file of files) {
        await convertOne(file);
      }
    } catch {
      console.error(`error: ${path.relative(ROOT, dir)}`);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
