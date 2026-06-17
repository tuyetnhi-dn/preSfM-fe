"use client";

import {
  Activity,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Globe2,
  Lock,
  Loader2,
  XCircle,
} from "lucide-react";
import { useLocale } from "next-intl";

import type { ProjectListItemDto } from "@/types/dtos/project/project.dto";
import { EntityCard } from "@/components/EntityCard";

type Props = {
  project: ProjectListItemDto;
};

function StatusIconWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-base)] bg-[var(--bg-panel)] text-[var(--text-muted)] shadow-sm"
    >
      {children}
    </span>
  );
}

function getPipelineStatusIcon(status?: string | null) {
  switch (status) {
    case "completed":
      return (
        <StatusIconWrapper title="Pipeline completed">
          <CheckCircle2 className="h-4 w-4 text-[var(--brand)]" />
        </StatusIconWrapper>
      );

    case "running":
    case "processing":
      return (
        <StatusIconWrapper title="Pipeline running">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--brand)]" />
        </StatusIconWrapper>
      );

    case "failed":
    case "error":
      return (
        <StatusIconWrapper title="Pipeline failed">
          <XCircle className="h-4 w-4 text-[var(--text-muted)]" />
        </StatusIconWrapper>
      );

    case "pending":
      return (
        <StatusIconWrapper title="Pipeline pending">
          <Clock3 className="h-4 w-4 text-[var(--text-muted)]" />
        </StatusIconWrapper>
      );

    default:
      return (
        <StatusIconWrapper title="Pipeline not started">
          <Activity className="h-4 w-4 text-[var(--text-muted)]" />
        </StatusIconWrapper>
      );
  }
}

function getVisibilityIcon(visibility: string) {
  if (visibility === "public") {
    return (
      <StatusIconWrapper title="Public project">
        <Globe2 className="h-4 w-4 text-[var(--brand)]" />
      </StatusIconWrapper>
    );
  }

  return (
    <StatusIconWrapper title="Private project">
      <Lock className="h-4 w-4 text-[var(--text-muted)]" />
    </StatusIconWrapper>
  );
}

export function ProjectCard({ project }: Props) {
  const locale = useLocale();

  const pipelineStatus = project.latestPipeline?.status ?? null;

  return (
    <EntityCard
      href={`/${locale}/projects/${project.id}`}
      coverImageUrl={project.coverImageUrl}
      coverIcon={<FolderKanban className="h-12 w-12" />}
      coverStatusIcons={
        <>
          {getVisibilityIcon(project.visibility)}
          {getPipelineStatusIcon(pipelineStatus)}
        </>
      }
      title={project.name}
      subtitle={`Project ID: ${project.id}`}
      description={project.description}
    />
  );
}
