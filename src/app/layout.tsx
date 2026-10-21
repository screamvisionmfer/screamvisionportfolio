import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NoirMode } from "@/components/site-settings/NoirMode";

export const metadata: Metadata = {
  title: "SCREAM VISION — Cover Art",
  description: "Selected cover artwork by SCREAM VISION.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d7ff3f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><NoirMode />{children}</body>
    </html>
  );
}
