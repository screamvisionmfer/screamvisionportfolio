import type { Metadata, Viewport } from "next";
import "./globals.css";
import { HapticFeedback } from "@/components/haptics/HapticFeedback";
import { NoirMode } from "@/components/site-settings/NoirMode";
import { RoomArrival } from "@/components/portfolio-home/RoomArrival";

export const metadata: Metadata = {
  metadataBase: new URL("https://thescreamvision.vercel.app"),
  title: "SCREAM VISION — Cover Art",
  description: "Cover art, illustration, motion and collectible worlds by SCREAM VISION.",
  openGraph: { type: "website", siteName: "SCREAM VISION", title: "SCREAM VISION", description: "Cover art. Characters. Worlds.", images: [{ url: "/social-preview.jpg", width: 1200, height: 675, alt: "SCREAM VISION — Whole world in touch" }] },
  twitter: { card: "summary_large_image", title: "SCREAM VISION", description: "Cover art. Characters. Worlds.", images: ["/social-preview.jpg"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080a09",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><HapticFeedback /><NoirMode />{children}<RoomArrival /></body>
    </html>
  );
}
