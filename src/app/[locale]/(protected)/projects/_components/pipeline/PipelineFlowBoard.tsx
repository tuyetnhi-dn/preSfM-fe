"use client";

import { CheckCircle2 } from "lucide-react";

import { FlowIntroCard } from "../intro/FlowIntroCard";
import { ImageGrid } from "./ImageGrid";
import { PipelineStatusCard } from "../common/PipelineStatusCard";
import type { ImageAsset, ProcessingStage, UploadedVideoState } from "../types";
import { useTranslations } from "next-intl";

type PipelineFlowBoardProps = {
  uploadedVideo: UploadedVideoState | null;
  processingStage: ProcessingStage;
  pipelineRunId: string;
  rawImages: ImageAsset[];
  processedImages: ImageAsset[];
  maskImages: ImageAsset[];
};

export function PipelineFlowBoard({
  uploadedVideo,
  processingStage,
  pipelineRunId,
  rawImages,
  processedImages,
  maskImages,
}: PipelineFlowBoardProps) {
  const t = useTranslations("projects.pipelineFlowBoard");
  if (!uploadedVideo) return null;

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-white/5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink dark:text-slate-100">
            {t("title")}
          </h2>
        </div>
      </div>

      {/* <PipelineStatusCard processingStage={processingStage} /> */}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <FlowIntroCard
            variant="raw"
            title={t("line1.title")}
            description={t("line1.description")}
          />

          <ImageGrid
            title={t("line1.raw_title")}
            description={t("line1.raw_description")}
            images={rawImages}
            emptyText={t("line1.raw_empty")}
          />
        </div>

        <div className="space-y-4">
          <FlowIntroCard
            variant="processed"
            title={t("line2.title")}
            description={t("line2.description")}
          />

          <ImageGrid
            title={t("line2.processed_title")}
            description={t("line2.processed_description")}
            images={processedImages}
            emptyText={t("line2.processed_empty")}
          />

          <ImageGrid
            title={t("line2.mask_title")}
            description={t("line2.mask_description")}
            images={maskImages}
            emptyText={t("line2.mask_empty")}
          />
        </div>
      </div>
    </div>
  );
}
