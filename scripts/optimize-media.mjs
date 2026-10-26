import { readdir, mkdir, stat, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const output = path.join(publicDir, "optimized");
await mkdir(output, { recursive: true });
sharp.concurrency(2);
const manifest = JSON.parse(await readFile(path.join(root, "src/data/optimized-media.json"), "utf8").catch(() => "{}"));
const totals = {};
async function walk(dir, group) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const source = path.join(dir, entry.name);
    if (entry.isDirectory()) { await walk(source, group); continue; }
    if (!/\.(jpe?g|png|webp)$/i.test(entry.name)) continue;
    const relative = path.relative(publicDir, source).split(path.sep).join("/");
    const info = await stat(source);
    const id = createHash("sha256").update(`${relative}:${info.size}:${info.mtimeMs}:v1`).digest("hex").slice(0, 16);
    const variants = {};
    for (const width of [640, 1600]) {
      const name = `${id}-${width}.webp`;
      const destination = path.join(output, name);
      if (!(await stat(destination).catch(() => null))) {
        await sharp(source).rotate().resize(width, width, { fit: "inside", withoutEnlargement: true }).webp({ quality: width === 640 ? 78 : 85, effort: 4 }).toFile(destination);
      }
      variants[width] = `/optimized/${name}`;
      totals[group] ??= { originals: 0, thumbnails: 0, previews: 0, count: 0 };
      totals[group][width === 640 ? "thumbnails" : "previews"] += (await stat(destination)).size;
    }
    totals[group].originals += info.size;
    totals[group].count++;
    manifest[`/${relative}`] = variants;
  }
}
// Covers are prepared separately with artist/project metadata and video compression.
for (const group of ["illustrations", "collabs", "cards"]) {
  await walk(path.join(publicDir, group), group);
  console.log(group, totals[group]);
}
await writeFile(path.join(root, "src/data/optimized-media.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Prepared ${Object.keys(manifest).length} images; originals preserved.`);
