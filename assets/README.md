# Cover library

- `originals/covers/`: local full-quality archive of the imported artist folders. Ignored by Git; back this folder up separately.
- `../public/covers/<artist>/<project>/`: compressed, deployable WebP images and H.264 MP4 video.
- `../public/optimized/cover-*-640.webp`: small gallery images.
- `../scripts/cover-sources.json`: reviewed artist, project, year and source-asset assignments. Missing years remain empty.
- `../src/data/cover-catalog.json`: generated website catalog. Existing project IDs are kept for old links.

To prepare the reviewed library again: `node scripts/prepare-cover-library.mjs <path-to-ffmpeg>`.
Originals are never overwritten. Existing prepared files are reused; remove only a changed project's generated files before re-encoding it.
Add new source assets to the local archive and register their roles in cover-sources.json. Tracklists, alternate covers and typography belong to the same project, rather than separate gallery entries.
