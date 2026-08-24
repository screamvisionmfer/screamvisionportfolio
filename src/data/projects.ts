import { covers } from "./covers";

export type ProjectAsset = {
  type: "cover" | "motion" | "tracklist" | "canvas";
  label: string;
  src: string;
  hasAudio?: boolean;
};

export type CoverProject = {
  slug: string;
  title: string;
  artist: string;
  year: string;
  cover: string;
  accent: string;
  tools: string[];
  services: string[];
  assets: ProjectAsset[];
};

const extras: Record<string, ProjectAsset[]> = {
  "hottest-otw": [
    { type: "motion", label: "Motion cover", src: "/covers/Crash Rarri - Hottest OTW 2022/hottest otw motion.mp4" },
    { type: "tracklist", label: "Tracklist", src: "/covers/Crash Rarri - Hottest OTW 2022/hottest otw tracklist.jpg" },
  ],
  "with-or-without-you": [
    { type: "motion", label: "Motion cover", src: "/covers/94Fatso - With Or Without You 2024/motion.mp4" },
  ],
  bump: [
    { type: "motion", label: "Motion cover", src: "/covers/3COMMA$ - BUMP 2024/MOTION.mp4" },
  ],
  understood: [
    { type: "motion", label: "Motion cover", src: "/covers/DRE DRILLA BASKET CASE - UNDERSTOOD 2024/motion.mp4" },
  ],
  "clench-your-fist": [
    { type: "tracklist", label: "Tracklist 01", src: "/covers/Clench Your Fist - Cruel World 2024/CLENCH-YOUR-FIST-—-CRUEL-WORLD-BACKSIDE-(TRACKLIST)--BY-KULTSAINTS.jpg" },
    { type: "tracklist", label: "Tracklist 02", src: "/covers/Clench Your Fist - Cruel World 2024/CLENCH-YOUR-FIST-—-CRUEL-WORLD-BACKSIDE-(TRACKLIST 2)--BY-KULTSAINTS.jpg" },
    { type: "canvas", label: "Spotify Canvas", src: "/covers/Clench Your Fist - Cruel World 2024/CLENCH-YOUR-FIST - Spotify Canvas-2x-RIFE-RIFE4.0-50fps.old.mp4", hasAudio: false },
  ],
};

const projectArtists: Record<string, string> = {
  "hottest-otw": "CRASH RARRI",
  "with-or-without-you": "94FATSO",
  "crabs-in-a-barrel": "BIG HEAD BANDZ",
  bump: "3COMMA$",
  understood: "DRE DRILLA FT. BASKET CASE",
  "clench-your-fist": "CRUEL WORLD",
};

export const projects: CoverProject[] = covers.map((cover) => ({
  slug: cover.id,
  title: cover.title,
  artist: projectArtists[cover.id] ?? cover.artist,
  year: cover.year,
  cover: cover.image,
  accent: cover.accentColor,
  tools: ["Adobe Photoshop", ...(cover.motion || extras[cover.id]?.some((asset) => asset.type === "motion" || asset.type === "canvas") ? ["After Effects"] : [])],
  services: ["Cover artwork", ...(extras[cover.id]?.some((asset) => asset.type === "motion") ? ["Motion design"] : [])],
  assets: [
    { type: "cover", label: "Final cover", src: cover.image },
    ...(extras[cover.id] ?? []),
  ],
}));

export const projectBySlug = (slug: string) => projects.find((project) => project.slug === slug);
