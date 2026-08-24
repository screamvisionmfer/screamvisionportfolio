import type { Metadata } from "next";
import { IllustrationWorld } from "@/components/illustration-world/IllustrationWorld";

export const metadata: Metadata = {
  title: "Illustrations — SCREAM VISION",
  description: "Interactive illustration archive by SCREAM VISION.",
};

export default function IllustrationsPage() {
  return <IllustrationWorld />;
}
