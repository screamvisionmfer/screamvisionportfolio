export type CoverItem = {
  id: string;
  number: string;
  title: string;
  artist: string;
  year: string;
  image: string;
  motion?: string;
  backgroundFrom: string;
  backgroundTo: string;
  blobColor: string;
  accentColor: string;
  textColor: string;
  placeholder: { label: string; motif: "orbit" | "split" | "echo" | "signal" | "fold" | "pulse" };
};

const coverItems: CoverItem[] = [
  { id: "hottest-otw", number: "01", title: "Hottest OTW", artist: "SCREAM VISION", year: "2023", image: "/covers/#5976Hottest-OTW.jpg", backgroundFrom: "#d8ff3e", backgroundTo: "#b7ef56", blobColor: "#7048e8", accentColor: "#f0642d", textColor: "#16170e", placeholder: { label: "HOTTEST / OTW", motif: "orbit" } },
  { id: "with-or-without-you", number: "02", title: "With Or Without You", artist: "SCREAM VISION", year: "2023", image: "/covers/#6028With-Or-Without-You.jpg", backgroundFrom: "#ff906f", backgroundTo: "#ef5a48", blobColor: "#ffd8b8", accentColor: "#5b37d1", textColor: "#21100b", placeholder: { label: "WITH OR / WITHOUT YOU", motif: "split" } },
  { id: "crabs-in-a-barrel", number: "03", title: "Crabs In A Barrel", artist: "SCREAM VISION", year: "2023", image: "/covers/#6224crabs-in-a-barrel.jpg", backgroundFrom: "#7ddcf4", backgroundTo: "#4eb3dc", blobColor: "#fff07d", accentColor: "#20388f", textColor: "#091c22", placeholder: { label: "CRABS IN / A BARREL", motif: "echo" } },
  { id: "bump", number: "04", title: "Bump", artist: "SCREAM VISION", year: "2023", image: "/covers/#6811BUMP.jpg", backgroundFrom: "#bd8df3", backgroundTo: "#8d63dd", blobColor: "#ffb0c8", accentColor: "#392067", textColor: "#160d20", placeholder: { label: "BUMP", motif: "signal" } },
  { id: "cameos", number: "05", title: "Cameos", artist: "SCREAM VISION", year: "2023", image: "/covers/#7115Cameos.jpg", backgroundFrom: "#ffca4b", backgroundTo: "#f09339", blobColor: "#e74755", accentColor: "#243071", textColor: "#231608", placeholder: { label: "CAMEOS", motif: "fold" } },
  { id: "understood", number: "06", title: "Understood", artist: "SCREAM VISION", year: "2024", image: "/covers/#8346UNDERSTOOD.jpg", backgroundFrom: "#86e3bd", backgroundTo: "#48bc9b", blobColor: "#264f83", accentColor: "#ffddd0", textColor: "#071b15", placeholder: { label: "UNDERSTOOD", motif: "pulse" } },
  { id: "clench-your-fist", number: "07", title: "Clench Your Fist", artist: "SCREAM VISION", year: "2023", image: "/covers/CLENCH-YOUR-FIST-—-CRUEL-WORLD-FRONT-COVER-BY-KULTSAINTS.jpg", backgroundFrom: "#efb4d0", backgroundTo: "#d987ad", blobColor: "#7c2f4f", accentColor: "#f7dc75", textColor: "#251019", placeholder: { label: "CLENCH / YOUR FIST", motif: "orbit" } },
  { id: "im-lit", number: "08", title: "I’m Lit", artist: "SCREAM VISION", year: "2021", image: "/covers/IM LIT.jpg", backgroundFrom: "#ef6a42", backgroundTo: "#ca3d34", blobColor: "#25283f", accentColor: "#ffd16a", textColor: "#210c08", placeholder: { label: "I’M / LIT", motif: "split" } },
  { id: "motorbound-2", number: "09", title: "MotorBound 2", artist: "SCREAM VISION", year: "2022", image: "/covers/MotorBound-2.jpg", backgroundFrom: "#b3c8f4", backgroundTo: "#7e9ee1", blobColor: "#ef6d54", accentColor: "#23326b", textColor: "#10172b", placeholder: { label: "MOTOR / BOUND 2", motif: "echo" } },
];

const projectArtists: Record<string, string> = {
  "hottest-otw": "CRASH RARRI",
  "with-or-without-you": "94FATSO",
  "crabs-in-a-barrel": "BIG HEAD BANDZ",
  bump: "3COMMA$",
  understood: "DRE DRILLA FT. BASKET CASE",
  "clench-your-fist": "CRUEL WORLD",
};

export const covers = coverItems.map((cover, index) => ({
  ...cover,
  artist: projectArtists[cover.id] ?? cover.artist,
  image: [
    "/covers/Crash Rarri - Hottest OTW 2022/hottest otw cover.jpg",
    "/covers/94Fatso - With Or Without You 2024/%236028With-Or-Without-You.jpg",
    "/covers/cover-03.webp",
    "/covers/3COMMA$ - BUMP 2024/3COMMA$ - BUMP 2024.jpg",
    "/covers/cover-05.webp",
    "/covers/DRE DRILLA BASKET CASE - UNDERSTOOD 2024/%238346UNDERSTOOD.jpg",
    "/covers/cover-07.webp",
    "/covers/cover-08.webp",
    "/covers/cover-09.webp",
  ][index],
  motion: [
    "/covers/Crash Rarri - Hottest OTW 2022/hottest otw motion.mp4",
    "/covers/94Fatso - With Or Without You 2024/motion.mp4",
    undefined,
    "/covers/3COMMA$ - BUMP 2024/MOTION.mp4",
    undefined,
    "/covers/DRE DRILLA BASKET CASE - UNDERSTOOD 2024/motion.mp4",
    undefined,
    undefined,
    undefined,
  ][index],
}));
