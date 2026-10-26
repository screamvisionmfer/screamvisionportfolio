export type CollectibleCard = { id: string; title: string; image: string; marketUrl?: string };
export type CardPack = {
  id: string;
  title: string;
  subtitle: string;
  edition: string;
  artwork: string;
  accent: string;
  marketUrl?: string;
  cards: CollectibleCard[];
};

// Add more packs here; each pack can have its own card count and market links.
// Leave marketUrl unset until the exact VibeMarket listing is supplied.
export const cardPacks: CardPack[] = [{
  id: "sbgc",
  title: "SBGC",
  subtitle: "Skull Board Game Club",
  edition: "Vibechain special edition",
  artwork: "/cards/SBGC/VIBECHAIN%20PACK%203.jpg",
  accent: "#e6f443",
  marketUrl: "https://vibechain.com/market/packs/base-skullboardgameclub",
  cards: Array.from({ length: 49 }, (_, index) => ({
    id: `sbgc-${index + 1}`,
    title: `SBGC #${String(index + 1).padStart(2, "0")}`,
    image: `/cards/SBGC/${index + 1}.jpg`,
  })),
}, {
  id: "dfc",
  title: "DFC",
  subtitle: "Degen Fight Club",
  edition: "Vibechain special edition",
  artwork: `/cards/${encodeURIComponent("DFC (DEGEN FIGHT CLUB)")}/${encodeURIComponent("Футбольный бойцовский клуб DFC.png")}`,
  accent: "#ff4934",
  marketUrl: "https://vibechain.com/market/packs/degen-fight-club",
  cards: Array.from({ length: 10 }, (_, index) => ({
    id: `dfc-${index + 1}`,
    title: `DFC #${String(index + 1).padStart(2, "0")}`,
    image: `/cards/${encodeURIComponent("DFC (DEGEN FIGHT CLUB)")}/${index + 1}.jpg`,
  })),
}, ...[
  { id: "stray-club", title: "STRAY CLUB", cardTitle: "STRAY", count: 32, accent: "#e0a86c" },
  { id: "stray-till-goat", title: "STRAY TILL GOAT", cardTitle: "GOAT", count: 11, accent: "#bcabdf", marketUrl: "https://vibechain.com/market/packs/stray-till-goat" },
  { id: "stray-till-nine", title: "STRAY TILL NINE", cardTitle: "NINE", count: 24, accent: "#b6c78e" },
].map((pack) => ({
  id: pack.id,
  title: pack.title,
  subtitle: pack.title,
  edition: "Vibechain special edition",
  artwork: `/cards/${pack.id}/cover.webp`,
  accent: pack.accent,
  marketUrl: pack.marketUrl,
  cards: Array.from({ length: pack.count }, (_, index) => ({
    id: `${pack.id}-${index + 1}`,
    title: `${pack.cardTitle} #${String(index + 1).padStart(2, "0")}`,
    image: `/cards/${pack.id}/${index + 1}.webp`,
  })),
}))];
