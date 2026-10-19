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
}];
