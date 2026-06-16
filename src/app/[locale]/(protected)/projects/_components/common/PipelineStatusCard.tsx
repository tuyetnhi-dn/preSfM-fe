"use client";

import { Layers } from "lucide-react";

import { UploadProgress } from "./UploadProgress";
import type { ProcessingStage } from "../types";

type PipelineStatusCardProps = {
  processingStage: ProcessingStage;
};

export function PipelineStatusCard({
  processingStage,
}: PipelineStatusCardProps) {
  if (processingStage !== "extracting" && processingStage !== "processing") {
    return null;
  }

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink dark:text-slate-100">
        <Layers className="h-4 w-4" />
        ...
      </div>

      <UploadProgress progress={processingStage === "extracting" ? 35 : 70} />
    </div>
  );
}
