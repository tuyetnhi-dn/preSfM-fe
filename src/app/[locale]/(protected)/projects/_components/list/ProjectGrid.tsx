import type { ProjectListItemDto } from "@/types/dtos/project/project.dto";
import { ProjectCard } from "./ProjectCard";

type Props = {
  projects: ProjectListItemDto[];
  emptyText?: string;
};

export function ProjectGrid({ projects, emptyText }: Props) {
  if (!projects.length) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
