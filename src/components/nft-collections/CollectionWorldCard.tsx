"use client";
import Image from "next/image";
import type { NftCollection } from "@/data/nft-collections";
import styles from "./collectionsArchive.module.css";
export const collectionCover=(collection:NftCollection)=>collection.artworks[collection.id==="floaties"?3:0].src;
export function CollectionWorldCard({collection,active,entering,onExplore}:{collection:NftCollection;active:boolean;entering:boolean;onExplore:()=>void}){
 return <button className={styles.consoleCard} data-active={active} data-entering={entering} aria-pressed={active} aria-label={active?`Explore ${collection.name}`:`Select ${collection.name}`} onClick={onExplore}>
  <span className={styles.consoleArt}><Image src={collectionCover(collection)} alt="" fill sizes="(max-width:700px) 78vw, 420px" unoptimized priority={active} draggable={false}/></span>
  <span className={styles.consoleLabel}><strong>{collection.shortName}</strong><span>{collection.chain}</span></span>
 </button>;
}
