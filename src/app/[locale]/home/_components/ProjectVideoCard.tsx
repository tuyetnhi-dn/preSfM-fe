"use client";

import { Film, HardDrive, UserRound } from "lucide-react";
import type { VideoItemType } from "@/types/dtos/video/video.dto";

type ProjectVideoCardProps = {
  video: VideoItemType;
  uploaderName: string;
};

function formatFileSize(sizeBytes: number) {
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
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-bg-panel">
      <div className="flex h-36 items-center justify-center bg-slate-100 dark:bg-slate-900">
        <Film className="h-12 w-12 text-slate-400 dark:text-slate-500" />
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-ink dark:text-slate-100">
            {video.originalName}
          </h3>

          <p className="mt-1 text-xs text-steel dark:text-slate-400">
            Project ID: {video.datasetId}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-steel dark:text-slate-300">
          <UserRound className="h-4 w-4" />
          <span>{uploaderName}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-steel dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <HardDrive className="h-4 w-4" />
            {formatFileSize(video.sizeBytes)}
          </span>

          <span>{formatDate(video.createdAt)}</span>
        </div>

        <div className="rounded-full bg-brand/10 px-3 py-1 text-center text-xs font-medium text-brand dark:bg-brand/20">
          {video.status}
        </div>
      </div>
    </article>
  );
}
