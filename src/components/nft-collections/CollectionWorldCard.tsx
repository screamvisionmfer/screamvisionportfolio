"use client";
import type { CSSProperties } from "react";
import type { NftCollection } from "@/data/nft-collections";
import { CollectionScene } from "./CollectionScene";
import styles from "./collectionsArchive.module.css";
export function CollectionWorldCard({collection,index,active,entering,onExplore}:{collection:NftCollection;index:number;active:boolean;entering:boolean;onExplore:()=>void}){
 return <button className={styles.portalWorld} style={{"--world-tint":collection.accent,"--world-mood":collection.mood} as CSSProperties} data-active={active} data-entering={entering} aria-pressed={active} aria-label={active?`Explore ${collection.name}`:`Select ${collection.name}`} onClick={onExplore}>
  <span className={styles.portalAmbient}/><span className={styles.portalNumber} aria-hidden="true">0{index+1}</span>
  <span className={styles.portalScene}><CollectionScene collection={collection} active={active} entering={entering}/></span>
  <span className={styles.portalIdentity}><span><small>{collection.chain} / {collection.supply.toLocaleString("en-US")} ARTWORKS</small><strong>{collection.shortName}</strong></span><i aria-hidden="true">↗</i></span>
 </button>;
}
