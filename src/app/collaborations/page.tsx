import type { Metadata } from "next";
import { CollaborationArchive } from "@/components/collaborations/CollaborationArchive";

export const metadata: Metadata = {
  title: "Collaborations — SCREAM VISION",
  description: "Selected collaborations by SCREAM VISION.",
};

export default function CollaborationsPage() {
  return <CollaborationArchive />;
}
