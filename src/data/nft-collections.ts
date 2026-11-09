import catalog from "./nft-collections.json";
export type NftCollection = {id:string;name:string;shortName:string;subtitle:string;chain:string;supply:number;minted:number;asOf:string;soldOut:boolean;volume?:string;currency?:string;website:string;marketplace:string;marketLabel:string;accent:string;mood:string;description:string;descriptionSource?:string;craft:string;source:string;marketData?:{holders:number;volume:number;currency:string;asOf:string;source:string};artworks:{src:string;label:string;source:string}[]};
export type CollectionStat = {minted:number;asOf:string;snapshot:boolean;holders?:number;volume?:number;currency?:string;marketAsOf?:string;marketSnapshot?:boolean};
export const nftCollections:NftCollection[]=catalog;
