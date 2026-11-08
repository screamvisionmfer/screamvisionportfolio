import type { Metadata } from "next";
import { ContactsHub } from "@/components/contacts-hub/ContactsHub";

export const metadata: Metadata = {
  title: "Links & Contact — SCREAM VISION",
  description: "Independent digital artist. Cover art, illustration, motion and collectible worlds. Contact SCREAM VISION and explore official links.",
  alternates: { canonical: "https://thescreamvision.vercel.app/contacts" },
  openGraph: {
    title: "SCREAM VISION — Contact & Links",
    description: "Cover art. Characters. Worlds. Get in touch and explore my work.",
    url: "https://thescreamvision.vercel.app/contacts",
    type: "profile",
    images: [{ url: "https://thescreamvision.vercel.app/social-preview.jpg", width: 1200, height: 675, alt: "SCREAM VISION — Whole world in touch" }],
  },
  twitter: { card: "summary_large_image", title: "SCREAM VISION — Contact & Links", description: "Cover art. Characters. Worlds.", images: ["https://thescreamvision.vercel.app/social-preview.jpg"] },
};

export default function ContactsPage() {
  return <ContactsHub />;
}
