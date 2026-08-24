export type Illustration = {
  id: string;
  title: string;
  year: string;
  medium: string;
  image: string;
  accent: string;
};

const illustrationFiles = [
  "B & P.webp",
  "BBC#2.webp",
  "BK.webp",
  "BLOOD INSIDE ALL OF US.webp",
  "BLOODBOY INVADER.webp",
  "BRAIN SLAYER.webp",
  "BRAINLAKE.webp",
  "BRAINLET SCHOOL.webp",
  "BRAINLET.webp",
  "BRAINMANCER.webp",
  "BREAKING NEWS.webp",
  "BRICK BY BRICK.webp",
  "BRICKHAMMER.webp",
  "DCA AGENCY.webp",
  "FLASK.webp",
  "FR.webp",
  "GBG.webp",
  "GUNSLINGER.webp",
  "HALLOWEEN TOWELIE.webp",
  "I FEEL THIS ART.webp",
  "I KNOW THAT FEEL.webp",
  "JB CONNECTING.webp",
  "JB DM #2.webp",
  "JB X BOBO.webp",
  "JBB 2.webp",
  "JBD3 WITH TITLES.webp",
  "JBI SMALL.webp",
  "JMFERS.webp",
  "JNR.webp",
  "JUNGLE BAY LAB.webp",
  "Jungle Bay Meme Death Match #4.webp",
  "KIM.webp",
  "LETS GET THE HONEY.webp",
  "MAGIC OF BLOOD.webp",
  "OHIO CITY.webp",
  "PATRON.webp",
  "PENOSE.webp",
  "PEPZARD.webp",
  "RING.webp",
  "SKOP BEER.webp",
  "SLOVO JUNGLE BAY.webp",
  "STONER.webp",
  "TOWELIE G.webp",
  "TOWELIE.webp",
  "VANDAL JB.webp",
  "WELCOME TO OHIO.webp",
  "WI.webp",
] as const;

const accents = ["#ef765e", "#62cddd", "#d79af8", "#d4ef64", "#f0b35c", "#7c9cff"];

const toId = (file: string, index: number) => `${String(index + 1).padStart(2, "0")}-${file
  .replace(/\.webp$/i, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")}`;

export const illustrations: Illustration[] = illustrationFiles.map((file, index) => ({
  id: toId(file, index),
  title: file.replace(/\.webp$/i, ""),
  year: "Archive",
  medium: "Digital illustration",
  image: `/illustrations/${encodeURIComponent(file)}`,
  accent: accents[index % accents.length],
}));
