"use client";

import { OpenSfMResultView } from "@/app/[locale]/(protected)/projects/_components/opensfm/OpenSfMResultView";
import { VideoPreview } from "@/app/[locale]/(protected)/projects/_components/upload/VideoPreview";
import {
  mapMaskFramesToImages,
  mapProcessedFramesToImages,
  mapRawFramesToImages,
} from "@/app/[locale]/(protected)/projects/_components/utils";
import { useGetAdminProjectDetailQuery } from "@/services/admin/admin.service";
import {
  useGetLatestProjectPipelineQuery,
  useGetProjectAssetsQuery,
} from "@/services/project/project.service";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  EyeOff,
  FolderGit2,
  FolderOpen,
  ImageIcon,
  Loader2,
  LoaderIcon,
  RefreshCcw,
  User,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AssetImageLike = {
  id?: string;
  name?: string;
  filename?: string;
  originalName?: string;
  path?: string;
  url?: string;
  src?: string;
  publicUrl?: string;
  thumbnailUrl?: string;
};

function getRouteParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

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

function getImageUrl(image: AssetImageLike) {
  return image.url ?? image.src ?? image.publicUrl ?? image.thumbnailUrl ?? "";
}

function getImageName(image: AssetImageLike, index: number) {
  return (
    image.name ??
    image.filename ??
    image.originalName ??
    image.path ??
    image.id ??
    `Image ${index + 1}`
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

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusIcon({ status }: { status?: string | null }) {
  if (status === "completed" || status === "active") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  }

  if (status === "failed") {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }

  if (status === "cancelled") {
    return <XCircle className="h-4 w-4 text-slate-400" />;
  }

  if (isActivePipeline(status)) {
    return <Loader2 className="h-4 w-4 animate-spin text-brand" />;
  }

  return <Clock3 className="h-4 w-4 text-slate-400" />;
}

function StatusBadge({ status }: { status?: string | null }) {
  const value = status ?? "unknown";

  const isCompleted = value === "completed";
  const isRunning = value === "running" || value === "processing";
  const isFailed = value === "failed";
  const isActive = value === "active";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        isCompleted || isActive
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

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-brand/10 p-2 text-brand">{icon}</div>
      </div>
    </div>
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
  icon: React.ReactNode;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-brand/10 p-2 text-brand">{icon}</div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">{description}</p>

            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {count} files
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={count === 0}
        onClick={onOpen}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <FolderOpen className="h-4 w-4" />
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
      <div className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{images.length} files</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close folder"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {images.length === 0 ? (
            <div className="rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800">
              No files found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {images.map((image, index) => {
                const imageUrl = getImageUrl(image);
                const imageName = getImageName(image, index);

                return (
                  <div
                    key={image.id ?? imageUrl ?? index}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="aspect-video bg-slate-200 dark:bg-slate-800">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={imageName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="line-clamp-2 break-all text-xs text-slate-600 dark:text-slate-300">
                        {imageName}
                      </p>
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

export default function AdminProjectDetailPage() {
  const locale = useLocale();
  const params = useParams<{ id?: string | string[] }>();
  const projectId = getRouteParam(params.id);

  const [openedFolder, setOpenedFolder] = useState<
    "raw" | "processed" | "masks" | null
  >(null);

  const {
    data: adminData,
    isLoading: isLoadingProject,
    isError: isProjectError,
  } = useGetAdminProjectDetailQuery(projectId, {
    skip: !projectId,
  });

  const {
    data: assets,
    isLoading: isLoadingAssets,
    refetch: refetchAssets,
  } = useGetProjectAssetsQuery(projectId, {
    skip: !projectId,
  });

  const {
    data: latestPipeline,
    isLoading: isLoadingPipeline,
    refetch: refetchLatestPipeline,
  } = useGetLatestProjectPipelineQuery(projectId, {
    skip: !projectId,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const rawImages = useMemo<AssetImageLike[]>(() => {
    if (!assets) return [];

    return mapRawFramesToImages(
      assets.folders?.rawImages ?? assets.rawImages ?? [],
    ) as AssetImageLike[];
  }, [assets]);

  const processedImages = useMemo<AssetImageLike[]>(() => {
    if (!assets) return [];

    return mapProcessedFramesToImages(
      assets.folders?.processedImages ?? assets.processedImages ?? [],
    ) as AssetImageLike[];
  }, [assets]);

  const maskImages = useMemo<AssetImageLike[]>(() => {
    if (!assets) return [];

    return mapMaskFramesToImages(
      assets.folders?.masks ?? assets.masks ?? [],
    ) as AssetImageLike[];
  }, [assets]);

  const project = adminData?.project;
  const adminPipelines = adminData?.pipelines ?? [];
  const displayPipeline = latestPipeline ?? adminPipelines[0] ?? null;

  const shouldPollPipeline = isActivePipeline(displayPipeline?.status);
  const hasResult = Boolean(latestPipeline?.result);

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

  if (isLoadingProject || isLoadingPipeline) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </section>
    );
  }

  if (isProjectError || !adminData || !project) {
    return (
      <section className="p-6 lg:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Unable to load project detail.
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-0 lg:grid-cols-[420px_1fr]">
          <div className="min-h-64 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 lg:border-b-0 lg:border-r">
            {assets?.video?.url ? (
              <VideoPreview
                src={assets.video.url}
                title={assets.video.originalName ?? project.name}
                sizeBytes={assets.video.sizeBytes}
                emptyText="No video found."
              />
            ) : isLoadingAssets ? (
              <div className="flex h-full min-h-64 items-center justify-center">
                <LoaderIcon className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center text-sm text-slate-500">
                No video found.
              </div>
            )}
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-brand">
                  Admin Project Detail
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {project.name}
                </h1>

                <p className="mt-2 max-w-3xl text-sm text-slate-500">
                  {project.description || "No description"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <VisibilityBadge visibility={project.visibility} />
                  <StatusBadge status={project.status} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  refetchLatestPipeline();
                  refetchAssets();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs text-slate-500">Pipeline status</p>

                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <StatusIcon status={displayPipeline?.status} />
                  {displayPipeline?.status ?? "unknown"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs text-slate-500">Progress</p>

                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {displayPipeline?.progress ?? 0}%
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs text-slate-500">Owner</p>

                <Link
                  href={`/${locale}/admin/users/${project.owner.id}`}
                  className="mt-2 block text-sm font-semibold text-brand hover:underline"
                >
                  {project.owner.fullName || project.owner.email}
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs text-slate-500">Created</p>
                <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(project.createdAt)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs text-slate-500">Updated</p>
                <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(project.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {shouldPollPipeline ? (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-brand" />

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Pipeline is running
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current stage:{" "}
                {displayPipeline?.currentStage ?? "pipeline_running"}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mb-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Project asset folders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Folder contents are hidden by default. Open a folder only when
              needed.
            </p>
          </div>

          {isLoadingAssets ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <AssetFolderCard
            title="Raw frames"
            description="Original extracted frames from uploaded video."
            count={rawImages.length}
            icon={<ImageIcon className="h-5 w-5" />}
            onOpen={() => setOpenedFolder("raw")}
          />

          <AssetFolderCard
            title="Processed frames"
            description="Preprocessed frames used for reconstruction."
            count={processedImages.length}
            icon={<FolderOpen className="h-5 w-5" />}
            onOpen={() => setOpenedFolder("processed")}
          />

          <AssetFolderCard
            title="Masks"
            description="Segmentation masks generated by the pipeline."
            count={maskImages.length}
            icon={<FolderGit2 className="h-5 w-5" />}
            onOpen={() => setOpenedFolder("masks")}
          />
        </div>
      </section>

      {hasResult ? <OpenSfMResultView result={latestPipeline?.result} /> : null}

      {openedFolderData ? (
        <AssetFolderModal
          title={openedFolderData.title}
          images={openedFolderData.images}
          onClose={() => setOpenedFolder(null)}
        />
      ) : null}
    </section>
  );
}
