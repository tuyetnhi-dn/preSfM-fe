"use client";

import { Film, HardDrive, UserRound } from "lucide-react";

import { EntityCard } from "@/components/EntityCard";
import type { VideoItemType } from "@/types/dtos/video/video.dto";

type ProjectVideoCardProps = {
  video: VideoItemType;
  uploaderName: string;
};

function formatFileSize(sizeBytes?: number) {
  if (!sizeBytes) return "0 MB";

  const mb = sizeBytes / 1024 / 1024;

  return `${mb.toFixed(2)} MB`;
}

function formatDate(value?: string) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("vi-VN");
}

export function ProjectVideoCard({
  video,
  uploaderName,
}: ProjectVideoCardProps) {
  return (
    <EntityCard
      coverIcon={<Film className="h-12 w-12" />}
      title={video.originalName}
      subtitle={`Dataset ID: ${video.datasetId}`}
      metaItems={[
        {
          icon: <UserRound className="h-4 w-4 shrink-0" />,
          value: uploaderName,
        },
      ]}
      footerLeft={
        <span className="inline-flex items-center gap-1">
          <HardDrive className="h-4 w-4 shrink-0" />
          {formatFileSize(video.sizeBytes)}
        </span>
      }
      footerRight={formatDate(video.createdAt)}
    />
  );
}
