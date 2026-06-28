"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  LoaderIcon,
  RefreshCcw,
  XCircle,
} from "lucide-react";

import {
  useGetLatestProjectPipelineQuery,
  useGetProjectAssetsQuery,
  useGetProjectByIdQuery,
  useUpdateProjectVisibilityMutation,
} from "@/services/project/project.service";

import Loader from "@/components/ui/loader";
import { getCurrentUser } from "@/lib/auth-storage";

import { PipelineFlowBoard } from "../_components/pipeline/PipelineFlowBoard";
import { OpenSfMResultView } from "../_components/opensfm/OpenSfMResultView";

import {
  mapMaskFramesToImages,
  mapProcessedFramesToImages,
  mapRawFramesToImages,
} from "../_utils/project-assets.mapper";

import type { UploadedVideoState } from "../_components/types";
import { VideoPreview } from "../_components/upload/VideoPreview";

type PipelineStatus =
  | "pending"
  | "running"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

function isActivePipeline(status?: string | null) {
  return (
    status === "pending" || status === "running" || status === "processing"
  );
}

function isFinalPipeline(status?: string | null) {
  return (
    status === "completed" || status === "failed" || status === "cancelled"
  );
}

function StatusIcon({ status }: { status?: string | null }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 text-[var(--brand)]" />;
  }

  if (status === "failed") {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }

  if (status === "cancelled") {
    return <XCircle className="h-4 w-4 text-[var(--text-muted)]" />;
  }

  if (isActivePipeline(status)) {
    return <Loader2 className="h-4 w-4 animate-spin text-[var(--brand)]" />;
  }

  return <Clock3 className="h-4 w-4 text-[var(--text-muted)]" />;
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "--";

  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return "--";

  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function ProjectDetailPage() {
  const t = useTranslations("projectDetail");
  const params = useParams();
  const projectId = params.id as string;

  const currentUser = getCurrentUser();

  const {
    data: project,
    isLoading: isLoadingProject,
    refetch: refetchProject,
  } = useGetProjectByIdQuery({
    id: projectId,
    userId: currentUser?.id,
  });

  const {
    data: latestPipeline,
    isLoading: isLoadingPipeline,
    refetch: refetchLatestPipeline,
  } = useGetLatestProjectPipelineQuery(projectId, {
    pollingInterval: isActivePipeline(undefined) ? 5000 : 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const shouldPollPipeline = isActivePipeline(latestPipeline?.status);

  const {
    data: assets,
    isLoading: isLoadingAssets,
    refetch: refetchAssets,
  } = useGetProjectAssetsQuery(projectId, {
    skip: !projectId,
  });

  const [updateVisibility, { isLoading: isUpdatingVisibility }] =
    useUpdateProjectVisibilityMutation();

  useEffect(() => {
    if (!shouldPollPipeline) return;

    const timer = window.setInterval(() => {
      refetchLatestPipeline();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [shouldPollPipeline, refetchLatestPipeline]);

  useEffect(() => {
    if (!latestPipeline?.currentStage) return;
    if (isFinalPipeline(latestPipeline.status)) return;

    refetchAssets();
  }, [latestPipeline?.currentStage, latestPipeline?.status, refetchAssets]);

  useEffect(() => {
    if (latestPipeline?.status === "completed") {
      refetchAssets();
    }
  }, [latestPipeline?.status, refetchAssets]);

  const rawImages = useMemo(() => {
    if (!assets) return [];

    return mapRawFramesToImages(
      assets.folders?.rawImages ?? assets.rawImages ?? [],
    );
  }, [assets]);

  const processedImages = useMemo(() => {
    if (!assets) return [];

    return mapProcessedFramesToImages(
      assets.folders?.processedImages ?? assets.processedImages ?? [],
    );
  }, [assets]);

  const maskImages = useMemo(() => {
    if (!assets) return [];

    return mapMaskFramesToImages(assets.folders?.masks ?? assets.masks ?? []);
  }, [assets]);

  const uploadedVideo: UploadedVideoState | null = project?.videoId
    ? {
        id: project.videoId,
        datasetId: project.datasetId ?? "",
        projectId: project.id,
        originalName: project.name,
      }
    : null;

  const comparison = latestPipeline?.result?.comparison;

  const hasRawImages = rawImages.length > 0;
  const hasProcessedImages = processedImages.length > 0;
  const hasMasks = maskImages.length > 0;
  const hasAnyAssets = hasRawImages || hasProcessedImages || hasMasks;
  const hasResult = Boolean(latestPipeline?.result);

  const isCompleted = latestPipeline?.status === "completed";
  const isFailed = latestPipeline?.status === "failed";
  const isCancelled = latestPipeline?.status === "cancelled";

  const handleChangeVisibility = async (value: "public" | "private") => {
    if (!project?.id) return;

    if (!currentUser?.id) {
      toast.error(t("toast.invalidSession"));
      return;
    }

    try {
      await updateVisibility({
        id: project.id,
        userId: currentUser.id,
        visibility: value,
      }).unwrap();

      toast.success(
        value === "public"
          ? t("toast.visibilityPublic")
          : t("toast.visibilityPrivate"),
      );

      refetchProject();
    } catch {
      toast.error(t("toast.visibilityFailed"));
    }
  };

  const handleManualRefresh = () => {
    refetchLatestPipeline();
    refetchAssets();
  };

  if (isLoadingProject || isLoadingPipeline) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Loader className="mx-auto animate-spin w-8 h-8" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)]">
        <div className="grid gap-0 lg:grid-cols-[420px_1fr]">
          <div className="min-h-64 border-b border-[var(--border-base)] bg-[var(--bg-hover)] lg:border-b-0 lg:border-r">
            {assets?.video?.url ? (
              <VideoPreview
                src={assets.video.url}
                title={assets.video.originalName ?? project?.name}
                sizeBytes={assets.video.sizeBytes}
                emptyText={t("noVideo")}
              />
            ) : (
              <LoaderIcon className="mx-auto text-center animate-spin w-8 h-8" />
            )}
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--brand)]">
                  {t("eyebrow")}
                </p>

                <h1 className="mt-1 text-2xl font-bold text-[var(--text-base)]">
                  {project?.name ?? t("untitledProject")}
                </h1>

                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {project?.description ?? t("noDescription")}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-4">
                <p className="text-xs text-[var(--text-muted)]">
                  {t("pipelineStatus")}
                </p>

                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-base)]">
                  <StatusIcon status={latestPipeline?.status} />
                  {t(`status.${latestPipeline?.status ?? "unknown"}`)}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-4">
                <p className="text-xs text-[var(--text-muted)]">
                  {t("progress")}
                </p>

                <p className="mt-2 text-sm font-semibold text-[var(--text-base)]">
                  {latestPipeline?.progress ?? 0}%
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-4">
                <p className="text-xs text-[var(--text-muted)]">
                  {t("visibility")}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  {project?.visibility === "public" ? (
                    <Eye className="h-4 w-4 text-[var(--brand)]" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-[var(--text-muted)]" />
                  )}

                  <select
                    value={project?.visibility ?? "private"}
                    disabled={isUpdatingVisibility}
                    onChange={(event) =>
                      handleChangeVisibility(
                        event.target.value as "public" | "private",
                      )
                    }
                    className="w-full rounded-lg border border-[var(--border-base)] bg-[var(--bg-panel)] px-2 py-1.5 text-xs font-medium text-[var(--text-base)] outline-none transition hover:border-[var(--border-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="private">{t("visibilityPrivate")}</option>
                    <option value="public">{t("visibilityPublic")}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {shouldPollPipeline ? (
        <section className="rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)] p-5">
          <div className="flex items-start gap-3">
            <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-[var(--brand)]" />

            <div>
              <h2 className="text-sm font-semibold text-[var(--text-base)]">
                {t("runningTitle")}
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t("runningDescription", {
                  stage: latestPipeline?.currentStage ?? "pipeline_running",
                })}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {isLoadingAssets && !hasAnyAssets ? (
        <section className="rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)] p-6">
          <Loader className="mx-auto" />
          <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
            {t("loadingAssets")}
          </p>
        </section>
      ) : null}

      {hasAnyAssets ? (
        <PipelineFlowBoard
          uploadedVideo={uploadedVideo}
          processingStage={isCompleted ? "ready" : "uploaded"}
          pipelineRunId={latestPipeline?.id ?? ""}
          rawImages={rawImages}
          processedImages={processedImages}
          maskImages={maskImages}
        />
      ) : null}

      {hasResult ? (
        <OpenSfMResultView
          projectId={projectId}
          result={latestPipeline?.result}
        />
      ) : null}

      {isCompleted && !hasResult ? (
        <section className="rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)] p-5 text-sm text-[var(--text-muted)]">
          {t("completedWithoutResult")}
        </section>
      ) : null}

      {isFailed ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">{t("failedTitle")}</p>
          <p className="mt-1">
            {latestPipeline?.errorMessage ?? t("failedDescription")}
          </p>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium transition hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900"
          >
            {t("reloadStatus")}
          </button>
        </section>
      ) : null}

      {isCancelled ? (
        <section className="rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)] p-5 text-sm text-[var(--text-muted)]">
          {t("cancelledDescription")}
        </section>
      ) : null}

      {!latestPipeline ? (
        <section className="rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)] p-5 text-sm text-[var(--text-muted)]">
          {t("noPipeline")}
        </section>
      ) : null}
    </main>
  );
}
