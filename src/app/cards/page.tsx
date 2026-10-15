import type { Metadata } from "next";
import { CardArchive } from "@/components/card-archive/CardArchive";

export const metadata: Metadata = { title: "Card packs — SCREAM VISION", description: "Unpack collectible art by SCREAM VISION. Explore every card in the Skull Board Game Club collection." };
export default function CardsPage() { return <CardArchive />; }
