import type { Metadata } from "next";
import { PortfolioHome } from "@/components/portfolio-home/PortfolioHome";

export const metadata: Metadata = {
  title: "SCREAM VISION — Cover Art, Illustration & Collectible Worlds",
  description: "Explore cover artwork, illustrations, collectible card packs and collaborations by SCREAM VISION.",
};

export default function Home() {
  return <PortfolioHome />;
}
