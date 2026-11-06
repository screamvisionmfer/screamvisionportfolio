import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { nftCollections } from "@/data/nft-collections";
import { CollectionProject } from "@/components/nft-collections/CollectionProject";
export function generateStaticParams(){return nftCollections.map(collection=>({slug:collection.id}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const collection=nftCollections.find(item=>item.id===slug);return {title:collection?`${collection.name} — SCREAM VISION`:"Collection not found",description:collection?.description};}
export default async function CollectionPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const collection=nftCollections.find(item=>item.id===slug);if(!collection)notFound();return <CollectionProject key={collection.id} collection={collection}/>;}
