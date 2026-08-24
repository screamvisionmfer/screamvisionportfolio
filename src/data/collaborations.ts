export type Collaboration = {
  slug: string;
  title: string;
  partner: string;
  year: string;
  role: string[];
  hero: string;
  accent: string;
  externalUrl?: string;
  assets: Array<{ src: string; label: string; kind: "image" | "gif" | "video" }>;
};

const jungletsRoot = "/collabs/Junglets from Jungle Bay";

export const collaborations: Collaboration[] = [{
  slug: "junglets-from-jungle-bay",
  title: "Junglets from Jungle Bay",
  partner: "Jungle Bay",
  year: "2024",
  role: ["Illustration", "Character development", "Campaign artwork"],
  hero: `${jungletsRoot}/1080P.jpg`,
  accent: "#ee745d",
  externalUrl: "https://magiceden.io/marketplace/junglet",
  assets: [
    { src: `${jungletsRoot}/1080P.jpg`, label: "First lesson", kind: "image" },
    { src: `${jungletsRoot}/CLASSIC.jpg`, label: "Classic", kind: "image" },
    { src: `${jungletsRoot}/CUBE.gif`, label: "Cube study", kind: "gif" },
    { src: `${jungletsRoot}/JBC %232.jpg`, label: "Jungle Bay character", kind: "image" },
    { src: `${jungletsRoot}/BRICK BY BRICK.jpg`, label: "Brick by brick", kind: "image" },
    { src: `${jungletsRoot}/BRICKED.jpg`, label: "Bricked", kind: "image" },
    { src: `${jungletsRoot}/BUTTHEAD APE.jpg`, label: "Butthead Ape", kind: "image" },
    { src: `${jungletsRoot}/JBSTONE small.jpg`, label: "Stone study", kind: "image" },
    { src: `${jungletsRoot}/JUNGLE XP.jpg`, label: "Jungle XP", kind: "image" },
    { src: `${jungletsRoot}/KD.jpg`, label: "KD", kind: "image" },
    { src: `${jungletsRoot}/KRS.jpg`, label: "KRS", kind: "image" },
    { src: `${jungletsRoot}/MULTI.jpg`, label: "Multi", kind: "image" },
    { src: `${jungletsRoot}/prince albert.jpg`, label: "Prince Albert", kind: "image" },
  ],
}, {
  slug: "bojungles-from-jungle-bay",
  title: "Bojungles from Jungle Bay",
  partner: "Jungle Bay",
  year: "2024",
  role: ["Illustration", "Character development", "Motion artwork"],
  hero: "/collabs/Bojungles from Jungle Bay/BOBOHEAD.jpg",
  accent: "#64cddd",
  assets: [
    { src: "/collabs/Bojungles from Jungle Bay/BOBOHEAD.jpg", label: "Bobohead", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/BOBO PROGRAM.mp4", label: "Bobo Program", kind: "video" },
    { src: "/collabs/Bojungles from Jungle Bay/ETH COAST BOBO.jpg", label: "Eth Coast Bobo", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/AMIGO.jpg", label: "Amigo", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/FBI.jpg", label: "FBI", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/HOE.jpg", label: "Hoe", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/HRBOBO.jpg", label: "HR Bobo", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/KDS.jpg", label: "KDS", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/MEDIEVAL BOBO.jpg", label: "Medieval Bobo", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/NB.jpg", label: "NB", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/RAIDER BOBO.jpg", label: "Raider Bobo", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/SEX INCSTRUCTOR.jpg", label: "Sex Instructor", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/SGT BOBO wb.jpg", label: "Sgt Bobo", kind: "image" },
    { src: "/collabs/Bojungles from Jungle Bay/ub.mp4", label: "UB Motion", kind: "video" },
    { src: "/collabs/Bojungles from Jungle Bay/WEST SOLANA BOBO.jpg", label: "West Solana Bobo", kind: "image" },
  ],
}];
