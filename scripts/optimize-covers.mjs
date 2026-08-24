import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const coversDir = path.join(root, "public", "covers");
const sources = [
  "#5976Hottest-OTW.jpg",
  "#6028With-Or-Without-You.jpg",
  "#6224crabs-in-a-barrel.jpg",
  "#6811BUMP.jpg",
  "#7115Cameos.jpg",
  "#8346UNDERSTOOD.jpg",
  "CLENCH-YOUR-FIST-—-CRUEL-WORLD-FRONT-COVER-BY-KULTSAINTS.jpg",
  "IM LIT.jpg",
  "MotorBound-2.jpg",
];

await Promise.all(sources.map((source, index) =>
  sharp(path.join(coversDir, source))
    .rotate()
    .resize(1600, 1600, { fit: "cover", position: "centre", withoutEnlargement: true })
    .webp({ quality: 84, effort: 4 })
    .toFile(path.join(coversDir, `cover-${String(index + 1).padStart(2, "0")}.webp`)),
));

console.log(`Optimized ${sources.length} covers.`);
