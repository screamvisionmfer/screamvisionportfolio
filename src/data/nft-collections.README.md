# NFT collection catalogue

`nft-collections.json` stores official Vercel sites, marketplace links and selected artwork sources. Prepared WebP files live in `public/collections/`. Rebuild previews with `node scripts/prepare-nft-collections.mjs` from the project root.

Mint counters for Groypers and Bobros are refreshed server-side through `/api/collections`, cached for 30 minutes. Source identity, supply and integer bounds are checked. Source failures retain the dated catalogue snapshot; they never become zero mints. Mint count does not prove paid primary sales.

Floaties sold out (2,222 / 2,222) and trading volume (18.4K USDG) were confirmed by the artist with an OpenSea screenshot on 2026-11-06. This snapshot remains a fallback; the API refreshes publicly available holder/volume data.

Original artwork sample labels describe selected previews, not verified token IDs. The rare lineup uses verified metadata names and original local image files. Full collections remain on their own sites and marketplaces.


## Collection project details

- `collection-traits.json` contains aggregate statistics from the artist-provided archives, not token metadata or image files. Rebuild it with `python scripts/analyze-collection-metadata.py --bobros <zip> --floaties <zip> --groypers <zip>`. The analyzer checks token counts and unique names, excludes Rarity Rank, and counts distinct category/value pairs (including explicit None values).
- The UI displays only category/variant totals. Rarity Rank is used exclusively to select the top three MVP artworks; it is excluded from artistic trait totals. MVP previews are compressed from the corresponding original image filenames.
- Every metric starts its reveal and 2.8-second count only when that individual panel is sufficiently visible. Replay Scan remounts the panels to repeat the sequence.
- `/api/collections` refreshes public mint counts and OpenSea Floaties holder/volume data every 30 minutes. OpenSea statistics must match the collection name and total supply. On source failure, dated saved data remains available.
- Minted count is not a secondary-market sale count. Unavailable sales/holder statistics are omitted instead of shown as zero.
- Floaties market snapshot verified on 2026-11-09: 447 holders, 18413.84922228788 USDG volume.

- Collection descriptions were refreshed from the official Vercel websites and LaunchMyNFT on 2026-11-09. Groypers mint count was verified at 777/777 on LaunchMyNFT; the saved fallback now reflects sold out.
- Nine MVP thumbnails are derived from the original image files matching metadata token IDs and stored as WebP previews.
