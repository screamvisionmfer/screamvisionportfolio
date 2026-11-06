# NFT collection catalogue

`nft-collections.json` stores official Vercel sites, marketplace links and selected artwork sources. Prepared WebP files live in `public/collections/`. Rebuild previews with `node scripts/prepare-nft-collections.mjs` from the project root.

Mint counters for Groypers and Bobros are refreshed server-side through `/api/collections`, cached for 30 minutes. Source identity, supply and integer bounds are checked. Source failures retain the dated catalogue snapshot; they never become zero mints. Mint count does not prove paid primary sales.

Floaties sold out (2,222 / 2,222) and trading volume (18.4K USDG) were confirmed by the artist with an OpenSea screenshot on 2026-11-06. Volume is a dated snapshot, not a live price or volume feed. Update `asOf` when updating this snapshot.

Artwork sample labels describe selected previews, not verified token IDs. Full collections remain on their own sites and marketplaces.
