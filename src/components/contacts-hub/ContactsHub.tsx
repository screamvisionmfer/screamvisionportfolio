"use client";

import { nftCollections } from "@/data/nft-collections";
import { MobileContactCard } from "./MobileContactCard";
import { SiteNav } from "@/components/site-nav/SiteNav";
import styles from "./contactsHub.module.css";

type HubLink = { label: string; href: string; note: string };
type LinkGroup = { label: string; links: HubLink[] };

const groups: LinkGroup[] = [
  {
    label: "Connect",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/scream.vision", note: "@scream.vision" },
      { label: "Telegram", href: "https://t.me/screamdesign", note: "@screamdesign" },
      { label: "X / Twitter", href: "https://x.com/scream_vision", note: "@scream_vision" },
      { label: "YouTube", href: "https://www.youtube.com/channel/UCKjIU491x_eKNX2YTqFEyIg/featured", note: "SCREAM.VISION" },
    ],
  },
  {
    label: "Portfolio",
    links: [
      { label: "Dribbble", href: "https://dribbble.com/screamvision", note: "Selected work" },
      { label: "Behance", href: "https://www.behance.net/jimmyscream", note: "Extended portfolio" },
      { label: "Kultsaints", href: "https://linktr.ee/kultsaints", note: "Cover art project" },
    ],
  },
  {
    label: "Markets",
    links: [
      { label: "Rarible", href: "https://rarible.com/scream_vision", note: "NFT marketplace" },
      { label: "Exchange Art", href: "https://exchange.art/screamvision/nfts", note: "Digital editions" },
      { label: "Manifold", href: "https://manifold.gallery/base:0xe9a962176d18d40403906709601960c14782c019?utm_source=collector_app&utm_medium=claim&utm_campaign=info_section", note: "Artist releases" },
      { label: "Zora", href: "https://zora.co/@screamvision", note: "Onchain editions" },
      { label: "OpenSea", href: "https://opensea.io/screamvision", note: "Collected works" },
      { label: "Rodeo Club", href: "https://rodeo.club/@screamvision/posts", note: "Posts & editions" },
    ],
  },
  {
    label: "Collections",
    links: [
      ...nftCollections.map(collection=>({label:collection.name,href:collection.website,note:`${collection.chain} / ${collection.supply.toLocaleString("en-US")} artworks`})),
      { label: "Bojungles", href: "https://magiceden.io/collections/base/0x36afee4fadc3b77ff5f1f9a040e264150afb979a", note: "Jungle Bay / Base" },
      { label: "Junglets", href: "https://magiceden.io/marketplace/junglet", note: "Jungle Bay / Solana" },
      { label: "AncientBatz", href: "https://opensea.io/item/ethereum/0x12f32e9c86acc6a39eddfcb978013780c66ee0ad/3", note: "Ozzy Osbourne collaboration" },
      { label: "FrogFamBatz", href: "https://foundation.app/@screamvision?tab=splits", note: "Collaborative collection" },
    ],
  },
];

export function ContactsHub() {
  return <main className={styles.page}><SiteNav/><MobileContactCard groups={groups}/></main>;
}
