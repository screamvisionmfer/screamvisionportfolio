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

const jungletsRoot = "/collabs/Junglets for Jungle Bay";

export const collaborations: Collaboration[] = [{
  slug: "junglets-from-jungle-bay",
  title: "Junglets",
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
  title: "Bojungles",
  partner: "Jungle Bay",
  year: "2024",
  role: ["Illustration", "Character development", "Motion artwork"],
  hero: "/collabs/Bojungles for Jungle Bay/BOBOHEAD.jpg",
  accent: "#64cddd",
  assets: [
    { src: "/collabs/Bojungles for Jungle Bay/BOBOHEAD.jpg", label: "Bobohead", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/BOBO PROGRAM.mp4", label: "Bobo Program", kind: "video" },
    { src: "/collabs/Bojungles for Jungle Bay/ETH COAST BOBO.jpg", label: "Eth Coast Bobo", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/AMIGO.jpg", label: "Amigo", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/FBI.jpg", label: "FBI", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/HOE.jpg", label: "Hoe", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/HRBOBO.jpg", label: "HR Bobo", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/KDS.jpg", label: "KDS", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/MEDIEVAL BOBO.jpg", label: "Medieval Bobo", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/NB.jpg", label: "NB", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/RAIDER BOBO.jpg", label: "Raider Bobo", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/SEX INCSTRUCTOR.jpg", label: "Sex Instructor", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/SGT BOBO wb.jpg", label: "Sgt Bobo", kind: "image" },
    { src: "/collabs/Bojungles for Jungle Bay/ub.mp4", label: "UB Motion", kind: "video" },
    { src: "/collabs/Bojungles for Jungle Bay/WEST SOLANA BOBO.jpg", label: "West Solana Bobo", kind: "image" },
  ],
}, {
  "slug": "seeds-from-the-memetic-garden",
  "title": "Seeds From The Memetic Garden",
  "partner": "Jungle Bay",
  "year": "",
  "role": [
    "Illustration",
    "Character development"
  ],
  "hero": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Seeds.jpg",
  "accent": "#baa77b",
  "assets": [
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Amigo.png",
      "label": "Amigo",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/ATHFfer.png",
      "label": "ATHFfer",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Bankrdealer.jpg",
      "label": "Bankrdealer",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Coyotefer.png",
      "label": "Coyotefer",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/DMT Agent.jpg",
      "label": "DMT Agent",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Gang Gang Gang!.jpg",
      "label": "Gang Gang Gang!",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Kill Bear.jpg",
      "label": "Kill Bear",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Kingfer.png",
      "label": "Kingfer",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/MF3R_P33RT0P33R.gif",
      "label": "MF3R_P33RT0P33R",
      "kind": "gif"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Mferhead.png",
      "label": "Mferhead",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Mferman.gif",
      "label": "Mferman",
      "kind": "gif"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Nobrainfer.png",
      "label": "Nobrainfer",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/OG Garden Mfer.jpg",
      "label": "OG Garden Mfer",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Packers.jpg",
      "label": "Packers",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Pepefer.png",
      "label": "Pepefer",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Philosophy Mfer.gif",
      "label": "Philosophy Mfer",
      "kind": "gif"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Post Apocalyptic Mfer.png",
      "label": "Post Apocalyptic Mfer",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Regular Day.jpg",
      "label": "Regular Day",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Roninfer.gif",
      "label": "Roninfer",
      "kind": "gif"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Russian Criminal Mfer.jpg",
      "label": "Russian Criminal Mfer",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Seeds.jpg",
      "label": "Seeds",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Sinner.png",
      "label": "Sinner",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Technique.png",
      "label": "Technique",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/The 69th Club.jpg",
      "label": "The 69th Club",
      "kind": "image"
    },
    {
      "src": "/collabs/Seeds From The Memetic Garden for Jungle Bay/Uniswap Bank.jpg",
      "label": "Uniswap Bank",
      "kind": "image"
    }
  ]
}];
