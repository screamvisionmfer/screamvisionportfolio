import { notFound } from "next/navigation";
import { ProjectGallery } from "@/components/project-gallery/ProjectGallery";
import { projectBySlug, projects } from "@/data/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  return <ProjectGallery project={project} />;
}
