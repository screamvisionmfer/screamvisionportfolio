"use client";

import Image, { type ImageProps, type ImageLoaderProps } from "next/image";
import manifest from "@/data/optimized-media.json";

const media: Record<string, { "640": string; "1600": string }> = manifest;
export function mediaSource(src: string, width = 640) {
  const variants = media[decodeURIComponent(src)];
  return variants ? variants[width <= 640 ? "640" : "1600"] : src;
}
const loader = ({ src, width }: ImageLoaderProps) => mediaSource(src, width);

/** Build-time derivatives avoid cold image transforms and preserve original files. */
export function PortfolioImage(props: ImageProps) {
  const prepared = typeof props.src === "string" && Boolean(media[decodeURIComponent(props.src)]);
  return <Image {...props} alt={props.alt} loader={prepared ? loader : undefined} unoptimized={!prepared} />;
}
