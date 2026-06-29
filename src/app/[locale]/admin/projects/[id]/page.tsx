"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  FolderGit2,
  FolderOpen,
  ImageIcon,
  Loader2,
  LoaderIcon,
  RefreshCcw,
  X,
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
import { VideoPreview } from "@/app/[locale]/(protected)/projects/_components/upload/VideoPreview";
import { OpenSfMResultView } from "@/app/[locale]/(protected)/projects/_components/opensfm/OpenSfMResultView";

type StorageAssetLike = {
  url?: string | null;
  path?: string | null;
  storageFileId?: string | null;
  bucket?: string | null;
};

type AssetImageLike = {
  id?: string | null;
  name?: string | null;
  filename?: string | null;
  originalName?: string | null;
  path?: string | null;
  url?: string | null;
  src?: string | null;
  publicUrl?: string | null;
  thumbnailUrl?: string | null;

  frameIndex?: number | null;
  timestampMs?: number | null;
  width?: number | null;
  height?: number | null;
  blurScore?: string | number | null;
  noiseScore?: string | number | null;
  isSelected?: boolean | null;
  rejectedReason?: string | null;

  raw?: StorageAssetLike | null;
  processed?: StorageAssetLike | null;
  mask?: StorageAssetLike | null;
};

type AssetFolderKind = "raw" | "processed" | "mask";

type ApiMessageResponse = {
  data?: {
    message?: string | string[];
    error?: string;
  };
  message?: string | string[];
  error?: string;
};

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

function firstNonEmpty(...values: Array<string | null | undefined>) {
  return (
    values
      .find((value) => typeof value === "string" && value.trim().length > 0)
      ?.trim() ?? ""
  );
}

function getStorageAssetByKind(
  image: AssetImageLike,
  kind: AssetFolderKind,
): StorageAssetLike | null | undefined {
  if (kind === "raw") return image.raw;
  if (kind === "processed") return image.processed;
  return image.mask;
}

function getFileNameFromPath(path?: string | null) {
  if (!path) return null;

  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

function normalizeAssetImages(
  images: AssetImageLike[] | undefined,
  kind: AssetFolderKind,
): AssetImageLike[] {
  if (!Array.isArray(images)) return [];

  return images.map((image, index) => {
    const nestedAsset = getStorageAssetByKind(image, kind);

    const path = firstNonEmpty(image.path, nestedAsset?.path);

    const url = firstNonEmpty(
      image.url,
      image.src,
      image.publicUrl,
      image.thumbnailUrl,
      nestedAsset?.url,
    );

    const name = firstNonEmpty(
      image.name,
      image.filename,
      image.originalName,
      getFileNameFromPath(path),
      `${kind}_frame_${index + 1}`,
    );

    return {
      ...image,
      id:
        image.id ??
        nestedAsset?.storageFileId ??
        `${kind}-${image.frameIndex ?? index}`,
      name,
      path,
      url,
      raw: image.raw ?? null,
      processed: image.processed ?? null,
      mask: image.mask ?? null,
    };
  });
}

function getImageUrl(image: AssetImageLike) {
  return firstNonEmpty(
    image.url,
    image.src,
    image.publicUrl,
    image.thumbnailUrl,
    image.raw?.url,
    image.processed?.url,
    image.mask?.url,
  );
}

function getImageName(image: AssetImageLike, index: number) {
  return firstNonEmpty(
    image.name,
    image.filename,
    image.originalName,
    image.path,
    image.raw?.path,
    image.processed?.path,
    image.mask?.path,
    image.id,
    `Image ${index + 1}`,
  );
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StatusIcon({ status }: { status?: string | null }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  }

  if (status === "failed") {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }

  if (status === "cancelled") {
    return <XCircle className="h-4 w-4 text-slate-400" />;
  }

  if (isActivePipeline(status)) {
    return <Loader2 className="h-4 w-4 animate-spin text-[var(--brand)]" />;
  }

  return <Clock3 className="h-4 w-4 text-slate-400" />;
}

function StatusBadge({ status }: { status?: string | null }) {
  const value = status ?? "unknown";

  const isCompleted = value === "completed";
  const isRunning = value === "running" || value === "processing";
  const isFailed = value === "failed";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        isCompleted
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
          : isRunning
            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
            : isFailed
              ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      ].join(" ")}
    >
      <StatusIcon status={value} />
      {value}
    </span>
  );
}

function VisibilityBadge({ visibility }: { visibility?: string | null }) {
  const value = visibility ?? "private";
  const isPublic = value === "public";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        isPublic
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      ].join(" ")}
    >
      {isPublic ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      {value}
    </span>
  );
}

function AssetFolderCard({
  title,
  description,
  count,
  icon,
  onOpen,
}: {
  title: string;
  description: string;
  count: number;
  icon: ReactNode;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[var(--brand)]/10 p-2 text-[var(--brand)]">
            {icon}
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text-base)]">{title}</h3>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {description}
            </p>

            <p className="mt-3 text-sm font-medium text-[var(--text-base)]">
              {count} files
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={count === 0}
        onClick={onOpen}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-base)] px-4 py-2.5 text-sm font-medium text-[var(--text-base)] transition hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FolderOpen className="h-4 w-4" />
        Open folder
      </button>
    </div>
  );
}

function AssetFolderModal({
  title,
  images,
  onClose,
}: {
  title: string;
  images: AssetImageLike[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[var(--bg-panel)] shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border-base)] px-5 py-4">
          <div>
            <h2 className="font-semibold text-[var(--text-base)]">{title}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {images.length} files
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            aria-label="Close folder"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {images.length === 0 ? (
            <div className="rounded-xl border border-[var(--border-base)] p-8 text-center text-sm text-[var(--text-muted)]">
              No files found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {images.map((image, index) => {
                const imageUrl = getImageUrl(image);
                const imageName = getImageName(image, index);

                return (
                  <div
                    key={`${image.id ?? image.path ?? imageUrl ?? index}`}
                    className="overflow-hidden rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)]"
                  >
                    <div className="aspect-video bg-[var(--bg-hover)]">
                      {imageUrl ? (
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open image in new tab"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={imageName}
                            className="h-full w-full object-cover transition hover:scale-[1.02]"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(event) => {
                              console.error("Image failed to load:", {
                                imageName,
                                imageUrl,
                                image,
                              });

                              event.currentTarget.style.display = "none";
                            }}
                          />
                        </a>
                      ) : (
                        <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="line-clamp-2 break-all text-xs text-[var(--text-muted)]">
                        {imageName}
                      </p>

                      {imageUrl ? (
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs font-medium text-[var(--brand)] hover:underline"
                        >
                          Open image
                        </a>
                      ) : (
                        <p className="mt-2 text-xs text-red-500">
                          Missing image URL
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getApiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;

  const response = payload as ApiMessageResponse;
  const message =
    response.data?.message ??
    response.message ??
    response.data?.error ??
    response.error;

  if (Array.isArray(message)) {
    return message.join("\n");
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return fallback;
}

export default function ProjectDetailPage() {
  const t = useTranslations("projectDetail");
  const params = useParams();
  const projectId = params.id as string;

  const currentUser = getCurrentUser();

  const [openedFolder, setOpenedFolder] = useState<
    "raw" | "processed" | "masks" | null
  >(null);

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
      refetchAssets();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [shouldPollPipeline, refetchLatestPipeline, refetchAssets]);

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

  const rawImages = useMemo<AssetImageLike[]>(() => {
    return normalizeAssetImages(
      assets?.folders?.rawImages ?? assets?.rawImages ?? [],
      "raw",
    );
  }, [assets]);

  const processedImages = useMemo<AssetImageLike[]>(() => {
    return normalizeAssetImages(
      assets?.folders?.processedImages ?? assets?.processedImages ?? [],
      "processed",
    );
  }, [assets]);

  const maskImages = useMemo<AssetImageLike[]>(() => {
    return normalizeAssetImages(
      assets?.folders?.masks ?? assets?.masks ?? [],
      "mask",
    );
  }, [assets]);

  const openedFolderData = useMemo(() => {
    if (openedFolder === "raw") {
      return {
        title: "Raw frames",
        images: rawImages,
      };
    }

    if (openedFolder === "processed") {
      return {
        title: "Processed frames",
        images: processedImages,
      };
    }

    if (openedFolder === "masks") {
      return {
        title: "Mask frames",
        images: maskImages,
      };
    }

    return null;
  }, [openedFolder, rawImages, processedImages, maskImages]);

  const hasResult = Boolean(latestPipeline?.result);
  const hasRawImages = rawImages.length > 0;
  const hasProcessedImages = processedImages.length > 0;
  const hasMasks = maskImages.length > 0;

  const isCompleted = latestPipeline?.status === "completed";
  const isFailed = latestPipeline?.status === "failed";
  const isCancelled = latestPipeline?.status === "cancelled";

  const canChangeVisibility = Boolean(currentUser?.id);

  const handleChangeVisibility = async (value: "public" | "private") => {
    if (!project?.id) return;

    if (!canChangeVisibility || !currentUser?.id) {
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
    } catch (error) {
      toast.error(getApiMessage(error, t("toast.visibilityFailed")));
    }
  };

  const handleManualRefresh = () => {
    refetchLatestPipeline();
    refetchAssets();
  };

  if (isLoadingProject || isLoadingPipeline) {
    return (
      <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <Loader className="mx-auto h-8 w-8 animate-spin" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6 overflow-hidden rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)] shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[420px_1fr]">
          <div className="min-h-64 border-b border-[var(--border-base)] bg-[var(--bg-hover)] lg:border-b-0 lg:border-r">
            {assets?.video?.url ? (
              <VideoPreview
                src={assets.video.url}
                title={assets.video.originalName ?? project?.name}
                sizeBytes={assets.video.sizeBytes}
                emptyText={t("noVideo")}
              />
            ) : isLoadingAssets ? (
              <div className="flex h-full min-h-64 items-center justify-center">
                <LoaderIcon className="h-8 w-8 animate-spin text-[var(--text-muted)]" />
              </div>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center text-sm text-[var(--text-muted)]">
                {t("noVideo")}
              </div>
            )}
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--brand)]">
                  {t("eyebrow")}
                </p>

                <h1 className="mt-1 text-2xl font-bold text-[var(--text-base)]">
                  {project?.name ?? t("untitledProject")}
                </h1>

                <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
                  {project?.description ?? t("noDescription")}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <VisibilityBadge visibility={project?.visibility} />
                  <StatusBadge status={project?.status} />
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualRefresh}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-base)] px-4 py-2.5 text-sm font-medium text-[var(--text-base)] transition hover:bg-[var(--bg-hover)]"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
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
                    disabled={!canChangeVisibility || isUpdatingVisibility}
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Created</p>
                <p className="mt-2 text-sm font-medium text-[var(--text-base)]">
                  {formatDate(project?.createdAt)}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Updated</p>
                <p className="mt-2 text-sm font-medium text-[var(--text-base)]">
                  {formatDate(project?.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {shouldPollPipeline ? (
        <section className="mb-6 rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-[var(--brand)]" />

            <div>
              <h2 className="text-sm font-semibold text-[var(--text-base)]">
                Pipeline is running
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Current stage:{" "}
                {latestPipeline?.currentStage ?? "pipeline_running"}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mb-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-base)]">
              Project asset folders
            </h2>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Folder contents are hidden by default. Open a folder only when
              needed.
            </p>
          </div>

          {isLoadingAssets ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <AssetFolderCard
            title="Raw frames"
            description="Original extracted frames from uploaded video."
            count={hasRawImages ? rawImages.length : 0}
            icon={<ImageIcon className="h-5 w-5" />}
            onOpen={() => setOpenedFolder("raw")}
          />

          <AssetFolderCard
            title="Processed frames"
            description="Preprocessed frames used for reconstruction."
            count={hasProcessedImages ? processedImages.length : 0}
            icon={<FolderOpen className="h-5 w-5" />}
            onOpen={() => setOpenedFolder("processed")}
          />

          <AssetFolderCard
            title="Masks"
            description="Segmentation masks generated by the pipeline."
            count={hasMasks ? maskImages.length : 0}
            icon={<FolderGit2 className="h-5 w-5" />}
            onOpen={() => setOpenedFolder("masks")}
          />
        </div>
      </section>

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

      {openedFolderData ? (
        <AssetFolderModal
          title={openedFolderData.title}
          images={openedFolderData.images}
          onClose={() => setOpenedFolder(null)}
        />
      ) : null}
    </main>
  );
}
