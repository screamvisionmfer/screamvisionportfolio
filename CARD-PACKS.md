# Card packs and optimized media

The `/cards` page is configured in `src/data/card-packs.ts`. Each entry is a separate booster with its own artwork, card list and optional `marketUrl`. Card entries may also have their own `marketUrl`; the individual viewer prefers that URL over the pack URL. Missing URLs show “VibeMarket link coming soon” without a fake purchase link.

SBGC uses the 49 numbered JPG files in `public/cards/SBGC`, in numeric order. `VIBECHAIN PACK 3.jpg` is the wrapper art and is not included in the card count. Titles are neutral file-number labels until actual names are supplied.

To add a collection:

1. Put originals in a new directory under `public/cards`.
2. Add a pack and its cards to `src/data/card-packs.ts`. Arrays may have different lengths. Supply exact listing URLs when available.
3. Run `npm run media:optimize`, then `npm run build`.

The media script generates 640px thumbnails and 1600px previews in `public/optimized`, plus `src/data/optimized-media.json`. It preserves the originals, respects aspect ratios, reuses derivatives of unchanged files and processes files sequentially to bound memory use. Commit generated assets and the manifest with the source change; no runtime image conversion is needed for prepared images. GIFs/videos keep their original format.

Initial media audit (bytes, entire folders; not a page-load timing claim):

| Folder | Images | Originals | 640px derivatives | 1600px derivatives |
| --- | ---: | ---: | ---: | ---: |
| illustrations | 47 | 180,938,796 | 3,738,888 | 27,651,778 |
| covers | 23 | 79,852,062 | 1,229,748 | 13,899,942 |
| collabs | 25 | 117,052,468 | 1,385,110 | 12,800,342 |
| cards | 50 | 219,806,867 | 2,436,914 | 25,499,970 |

Illustrations keeps lightweight grid shells for seamless wrapping but mounts images only within the viewport and a 220px margin. Its RAF loop stops when settled with drift off, when an artwork is open, and when the document is hidden. Covers no longer waits for a fabricated progress timer or downloads every project asset before navigation. Videos pause when the document is hidden; collaboration videos also pause behind the artwork viewer.

## Card interaction

The booster uses a lazy-loaded Three.js scene with a sculpted foil wrapper, a tearing seal, particles and seven sleeved cards that fan out into a horizontal showcase. The scene renders on demand, caps pixel ratio at 1.5, pauses while hidden, and disposes its resources when the collection opens. Reduced-motion and WebGL failure fallbacks keep the collection accessible.

The showcase mounts nine cards and supports drag, wheel, keyboard arrows and a position slider. Each card has pointer-driven tilt and sheen. All cards switches to a compact grid; inspection shows the full artwork with cyclic navigation. Repack restores the booster.

## Verification

- Production build, TypeScript and ESLint passed.
- All 145 manifest sources and 290 generated files were checked for existence.
- Browser baseline `/illustrations`: 193 image elements, 192 tile shells. After optimization at the desktop view: 13 image elements, all loaded. At 390×844: 25 image elements including the prefetch margin, all loaded. Counts vary with position and viewport.
- The animation marker becomes `false` with drift off and while inspecting an illustration. Keyboard movement and closing the preview resume the appropriate behavior. Covers also reports an idle RAF loop when settled; changing covers and opening the selected project were exercised.
- `/cards`: 49 inspect buttons, native modal opens, next/previous and keyboard arrows work, last-to-first wrapping works, Escape returns to the grid, and Repack restores one WebGL canvas and reopening removes it. Verified desktop and 390×844 layouts, with no broken loaded images. A fresh production Cards tab reported no console errors or warnings.
- Screenshot: `artifacts/cards-showcase.png`.

The browser inspection API did not expose `document.getAnimations()`. These checks establish resource counts and interaction behavior, not measured FPS, GPU memory, or a complete heap-leak audit.
