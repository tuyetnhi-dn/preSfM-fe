"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  useGetLatestProjectPipelineQuery,
  useGetProjectAssetsQuery,
  useGetProjectByIdQuery,
} from "@/services/project/project.service";

import { PipelineFlowBoard } from "../_components/pipeline/PipelineFlowBoard";
import { OpenSfMResultView } from "../_components/opensfm/OpenSfMResultView";

import {
  mapMaskFramesToImages,
  mapProcessedFramesToImages,
  mapRawFramesToImages,
} from "../_utils/project-assets.mapper";

import type { UploadedVideoState } from "../_components/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [pipelinePollingInterval, setPipelinePollingInterval] = useState(5000);
  const [lastFetchedStage, setLastFetchedStage] = useState("");

  const { data: project, isLoading: isLoadingProject } =
    useGetProjectByIdQuery(projectId);

  const {
    data: latestPipeline,
    isLoading: isLoadingPipeline,
    refetch: refetchLatestPipeline,
  } = useGetLatestProjectPipelineQuery(projectId, {
    pollingInterval: pipelinePollingInterval,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: assets,
    isLoading: isLoadingAssets,
    refetch: refetchAssets,
  } = useGetProjectAssetsQuery(projectId, {
    skip: !projectId,
  });

  useEffect(() => {
    if (!latestPipeline) return;

    const isFinished =
      latestPipeline.status === "completed" ||
      latestPipeline.status === "failed" ||
      latestPipeline.status === "cancelled";

    if (isFinished) {
      setPipelinePollingInterval(0);
    }
  }, [latestPipeline]);

  useEffect(() => {
    const currentStage = latestPipeline?.currentStage;

    if (!currentStage) return;
    if (currentStage === lastFetchedStage) return;

    setLastFetchedStage(currentStage);
    refetchAssets();
  }, [latestPipeline?.currentStage, lastFetchedStage, refetchAssets]);

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

  const isRunning =
    latestPipeline?.status === "pending" ||
    latestPipeline?.status === "running" ||
    latestPipeline?.status === "processing";

  const isCompleted = latestPipeline?.status === "completed";
  const isFailed = latestPipeline?.status === "failed";
  const isCancelled = latestPipeline?.status === "cancelled";

  const hasRawImages = rawImages.length > 0;
  const hasProcessedImages = processedImages.length > 0;
  const hasMasks = maskImages.length > 0;
  const hasAnyAssets = hasRawImages || hasProcessedImages || hasMasks;
  const hasResult = Boolean(latestPipeline?.result);

  if (isLoadingProject || isLoadingPipeline) {
    return (
      <section className="mx-auto max-w-6xl card p-6 sm:p-8">
        <p className="text-sm text-slate-500">Đang tải project...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl card p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
          Project Detail
        </p>

        <h1 className="mt-1 text-2xl font-bold text-ink dark:text-slate-100">
          {project?.name ?? "Untitled Project"}
        </h1>

        <p className="mt-2 text-sm text-steel dark:text-slate-400">
          Project ID: {projectId}
        </p>
      </div>

      {latestPipeline ? (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink dark:text-slate-100">
                Trạng thái pipeline
              </h2>

              <p className="mt-1 text-xs text-steel dark:text-slate-400">
                Pipeline ID: {latestPipeline.id}
              </p>

              <p className="mt-1 text-xs text-steel dark:text-slate-400">
                Stage hiện tại:{" "}
                {latestPipeline.currentStage ?? latestPipeline.status}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPipelinePollingInterval(5000);
                refetchLatestPipeline();
                refetchAssets();
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Tải lại
            </button>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${latestPipeline.progress ?? 0}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-steel dark:text-slate-400">
            Tiến độ: {latestPipeline.progress ?? 0}%
          </p>
        </div>
      ) : null}

      {isRunning ? (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

            <div>
              <h2 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Đang xử lý
              </h2>

              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                Giai đoạn: {latestPipeline?.currentStage ?? "pipeline_running"}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-blue-600 dark:text-blue-400">
            Bạn có thể rời trang này, pipeline vẫn tiếp tục chạy nền. Dữ liệu sẽ
            được cập nhật dần khi từng bước hoàn tất.
          </p>
        </div>
      ) : null}

      {isLoadingAssets && !hasAnyAssets ? (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          Đang tải ảnh, mask và kết quả...
        </div>
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

      {hasResult ? <OpenSfMResultView result={latestPipeline?.result} /> : null}

      {isCompleted && !hasResult ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Pipeline đã hoàn tất nhưng chưa có dữ liệu comparison trả về.
        </div>
      ) : null}

      {isFailed ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <p className="font-semibold">Pipeline thất bại</p>
          <p className="mt-1">
            {latestPipeline?.errorMessage ??
              "Quá trình xử lý gặp lỗi. Vui lòng kiểm tra log backend."}
          </p>

          <button
            type="button"
            onClick={() => {
              setPipelinePollingInterval(5000);
              refetchLatestPipeline();
              refetchAssets();
            }}
            className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900"
          >
            Tải lại trạng thái
          </button>
        </div>
      ) : null}

      {isCancelled ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Pipeline đã bị huỷ.
        </div>
      ) : null}

      {!latestPipeline ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          Project này chưa có pipeline nào.
        </div>
      ) : null}
    </section>
  );
}
