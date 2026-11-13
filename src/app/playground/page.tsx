import type { Metadata } from "next";
import { Playground } from "@/components/playground/Playground";

export const metadata: Metadata = {
 title: "Playground — SCREAM VISION",
 description: "Stories, moving images and worlds in the making. The SCREAM VISION playground.",
};
export default function PlaygroundPage(){return <Playground/>;}
