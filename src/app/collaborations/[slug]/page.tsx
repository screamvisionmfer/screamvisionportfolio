import { notFound } from "next/navigation";
import { CollaborationCase } from "@/components/collaborations/CollaborationCase";
import { collaborations } from "@/data/collaborations";

export function generateStaticParams() {
  return collaborations.map(({ slug }) => ({ slug }));
}

export default async function CollaborationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collaboration = collaborations.find((item) => item.slug === slug);
  if (!collaboration) notFound();
  return <CollaborationCase key={slug} collaboration={collaboration} />;
}
