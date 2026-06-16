"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { getCurrentUser } from "@/lib/auth-storage";
import { useAppStore } from "@/store/useAppStore";
import {
  useExtractFramesMutation,
  useGetVideoAssetsQuery,
  usePreprocessAndGenerateMasksMutation,
  useRunOpenSfMComparisonMutation,
  useUploadVideoMutation,
} from "@/services/video/video.service";
import type {
  ImageAssetItem,
  PipelineRunDto,
  VideoAssetsResponse,
} from "@/types/dtos/video/video.dto";

import {
  ImageAsset,
  ProcessingStage,
  UploadedVideoState,
} from "./_components/types";

import {
  getErrorMessage,
  mapMaskFramesToImages,
  mapProcessedFramesToImages,
  mapRawFramesToImages,
} from "./_components/utils";
import { ProjectUploadPanel } from "./_components/upload/ProjectUploadPanel";
import { PipelineFlowBoard } from "./_components/pipeline/PipelineFlowBoard";
import { PointCloudViewer } from "@/components/viewer/point-cloud-viewer";
import { RunOpenSfMComparisonResponse } from "@/types/dtos/video/opensfm.dto";

type UiJobStatus = "queued" | "processing" | "completed" | "failed";

function mapPipelineStatusToJobStatus(status?: string): UiJobStatus {
  if (status === "pending") return "queued";
  if (status === "completed") return "completed";
  if (status === "failed" || status === "cancelled") return "failed";
  return "processing";
}

function getPipelineStage(
  pipelineRun: PipelineRunDto | undefined,
  fallback: string,
) {
  return pipelineRun?.stage ?? fallback;
}

function normalizeFrameItems(items?: ImageAssetItem[] | null) {
  return (items ?? []).map((item) => ({
    ...item,
    width: item.width ?? 0,
    height: item.height ?? 0,
    timestampMs: item.timestampMs ?? 0,
    isSelected: item.isSelected ?? true,
    rejectedReason: item.rejectedReason ?? null,
    blurScore: item.blurScore ?? null,
    noiseScore: item.noiseScore ?? null,
  }));
}

function getStorageFileUrl(
  file?: {
    id?: string;
    storageFileId?: string;
    url?: string;
  } | null,
) {
  if (!file) return "";

  if (file.url) return file.url;

  const id = file.id ?? file.storageFileId;

  if (!id) return "";

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

  return `${baseUrl}/storage/files/${encodeURIComponent(id)}/download`;
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatError(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return value.toFixed(4);
}

export default function ProjectsPage() {
  const t = useTranslations("projects");
  const setJobStatus = useAppStore((state) => state.setJobStatus);

  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideoState | null>(
    null,
  );

  const [processingStage, setProcessingStage] =
    useState<ProcessingStage>("idle");

  const [pipelineRunId, setPipelineRunId] = useState("");

  const [rawImages, setRawImages] = useState<ImageAsset[]>([]);
  const [processedImages, setProcessedImages] = useState<ImageAsset[]>([]);
  const [maskImages, setMaskImages] = useState<ImageAsset[]>([]);
  const [opensfmResult, setOpensfmResult] =
    useState<RunOpenSfMComparisonResponse | null>(null);

  const [uploadVideo, { isLoading: isUploading }] = useUploadVideoMutation();

  const [extractFrames, { isLoading: isExtracting }] =
    useExtractFramesMutation();

  const [preprocessAndGenerateMasks, { isLoading: isPreprocessing }] =
    usePreprocessAndGenerateMasksMutation();
  const [runOpenSfMComparison, { isLoading: isRunningOpenSfM }] =
    useRunOpenSfMComparisonMutation();

  const { refetch: refetchAssets, isFetching: isFetchingAssets } =
    useGetVideoAssetsQuery(uploadedVideo?.id ?? "", {
      skip: !uploadedVideo?.id,
    });

  const resetPipelineState = () => {
    setMessage("");
    setUploadProgress(0);
    setUploadedVideo(null);
    setProcessingStage("idle");
    setPipelineRunId("");
    setRawImages([]);
    setProcessedImages([]);
    setMaskImages([]);
    setOpensfmResult(null);
  };

  const applyAssetsToState = (data: VideoAssetsResponse) => {
    const nextRawImages = data.folders?.rawImages ?? data.rawImages ?? [];
    const nextProcessedImages =
      data.folders?.processedImages ?? data.processedImages ?? [];
    const nextMasks = data.folders?.masks ?? data.masks ?? [];

    setRawImages(
      mapRawFramesToImages(
        normalizeFrameItems(nextRawImages) as Parameters<
          typeof mapRawFramesToImages
        >[0],
      ),
    );

    setProcessedImages(
      mapProcessedFramesToImages(
        normalizeFrameItems(nextProcessedImages) as Parameters<
          typeof mapProcessedFramesToImages
        >[0],
      ),
    );

    setMaskImages(
      mapMaskFramesToImages(
        normalizeFrameItems(nextMasks) as Parameters<
          typeof mapMaskFramesToImages
        >[0],
      ),
    );

    const totalMasks = data.totalMasks ?? nextMasks.length;
    const totalProcessedImages =
      data.totalProcessedImages ?? nextProcessedImages.length;
    const totalRawImages = data.totalRawImages ?? nextRawImages.length;

    if (totalMasks > 0) {
      setProcessingStage("ready");
      return;
    }

    if (totalProcessedImages > 0) {
      setProcessingStage("processed_completed");
      return;
    }

    if (totalRawImages > 0) {
      setProcessingStage("raw_completed");
      return;
    }

    setProcessingStage("uploaded");
  };

  const onUpload = async () => {
    if (!file) return;

    resetPipelineState();

    const currentUser = getCurrentUser();

    if (!currentUser?.id) {
      setMessage(t("invalidSession"));
      return;
    }

    if (!projectName.trim()) {
      setMessage(t("projectNameRequired"));
      return;
    }

    try {
      const response = await uploadVideo({
        file,
        uploadedBy: currentUser.id,
        projectName: projectName.trim(),
        onProgress: setUploadProgress,
      }).unwrap();

      setUploadedVideo({
        id: response.id,
        datasetId: response.datasetId,
        projectId: response.projectId,
        originalName: response.originalName,
      });

      setJobStatus({
        id: response.id,
        status: "queued",
        stage: "video-upload",
        progress: 100,
      });

      setProcessingStage("uploaded");
      setMessage(`${t("uploaded")}: ${response.originalName}`);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setMessage(errorMessage || t("uploadFailed"));
      setProcessingStage("failed");
    }
  };

  const onNextStep = async () => {
    if (!uploadedVideo?.id) return;

    setMessage("");
    setProcessingStage("extracting");

    try {
      const response = await extractFrames({
        id: uploadedVideo.id,
        body: {
          pipelineType: "processed",
          sampleFps: 2,
          config: {
            outputRawFolder: "raw_images",
            outputProcessedFolder: "processed_images",
            outputMaskFolder: "masks",
          },
        },
      }).unwrap();

      setPipelineRunId(response.pipelineRun.id);

      setJobStatus({
        id: response.pipelineRun.id,
        status: mapPipelineStatusToJobStatus(response.pipelineRun.status),
        stage: getPipelineStage(response.pipelineRun, "frame-extraction"),
        progress: response.pipelineRun.progress,
      });

      applyAssetsToState(response);

      setMessage(
        `Đã cắt frame thành công. Raw images: ${
          response.totalRawImages ?? response.rawImages?.length ?? 0
        }`,
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setMessage(errorMessage || "Không thể cắt frame từ video.");
      setProcessingStage("failed");
    }
  };

  const onPreprocessAndGenerateMasks = async () => {
    if (!uploadedVideo?.id) return;

    setMessage("Đang xử lý ảnh và tạo mask...");

    try {
      const response = await preprocessAndGenerateMasks({
        videoId: uploadedVideo.id,
        body: {
          ...(pipelineRunId ? { pipelineRunId } : {}),
          config: {
            blurThreshold: 100,
            noiseThreshold: 25,
            outputProcessedFolder: "processed_images",
            outputMaskFolder: "masks",
          },
        },
      }).unwrap();

      setJobStatus({
        id: response.pipelineRun.id,
        status: mapPipelineStatusToJobStatus(response.pipelineRun.status),
        stage: getPipelineStage(response.pipelineRun, "mask-generation"),
        progress: response.pipelineRun.progress,
      });

      applyAssetsToState(response);

      const latestAssets = await refetchAssets();

      if (latestAssets.data) {
        applyAssetsToState(latestAssets.data);
      }

      setMessage(
        `Xử lý hoàn tất. Processed images: ${
          response.totalProcessedImages ?? response.processedImages?.length ?? 0
        }, Masks: ${response.totalMasks ?? response.masks?.length ?? 0}`,
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setMessage(errorMessage || "Không thể xử lý ảnh và tạo mask.");
      setProcessingStage("failed");
    }
  };
  const onRunOpenSfMComparison = async () => {
    if (!uploadedVideo?.id) return;

    if (rawImages.length === 0) {
      setMessage("Cần cắt frame trước khi chạy OpenSfM.");
      return;
    }

    if (processedImages.length === 0 || maskImages.length === 0) {
      setMessage("Cần xử lý ảnh và tạo mask trước khi chạy OpenSfM.");
      return;
    }

    if (processedImages.length !== maskImages.length) {
      setMessage("Số lượng processed images và masks phải bằng nhau.");
      return;
    }

    setMessage("Đang chạy OpenSfM comparison...");

    try {
      const response = await runOpenSfMComparison({
        videoId: uploadedVideo.id,
        body: {
          ...(pipelineRunId ? { pipelineRunId } : {}),
          runDense: true,
        },
      }).unwrap();

      setOpensfmResult(response);
      setMessage("Chạy OpenSfM comparison hoàn tất.");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setMessage(errorMessage || "Không thể chạy OpenSfM comparison.");
    }
  };

  const canRunOpenSfM =
    Boolean(uploadedVideo?.id) &&
    rawImages.length > 0 &&
    processedImages.length > 0 &&
    processedImages.length === maskImages.length;

  const rawPlyUrl = getStorageFileUrl(opensfmResult?.rawFlow.ply);
  const processedPlyUrl = getStorageFileUrl(opensfmResult?.processedFlow.ply);

  return (
    <section className="mx-auto max-w-6xl card p-6 sm:p-8">
      <ProjectUploadPanel
        title={t("title")}
        subtitle={t("subtitle")}
        projectNameLabel={t("projectName")}
        projectNamePlaceholder={t("projectNamePlaceholder")}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        file={file}
        onFileSelect={setFile}
        onRemoveFile={() => setFile(null)}
        message={message}
        uploadProgress={uploadProgress}
        uploadedVideo={uploadedVideo}
        processingStage={processingStage}
        isUploading={isUploading}
        isExtracting={isExtracting}
        uploadButtonLabel={t("uploadButton")}
        nextButtonLabel={t("nextStepButton")}
        onUpload={onUpload}
        onNextStep={onNextStep}
      />

      {uploadedVideo?.id && rawImages.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <h3 className="text-sm font-semibold text-ink dark:text-slate-100">
              Bước tiếp theo
            </h3>

            <p className="mt-1 text-xs text-steel dark:text-slate-400">
              Sau khi đã cắt frame, hãy xử lý ảnh và tạo mask trước khi đưa vào
              OpenSfM.
            </p>
          </div>

          <button
            type="button"
            onClick={onPreprocessAndGenerateMasks}
            disabled={
              !uploadedVideo?.id ||
              isPreprocessing ||
              isFetchingAssets ||
              rawImages.length === 0
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPreprocessing || isFetchingAssets
              ? "Đang xử lý ảnh và tạo mask..."
              : "Xử lý ảnh + tạo mask"}
          </button>
        </div>
      )}

      <PipelineFlowBoard
        uploadedVideo={uploadedVideo}
        processingStage={processingStage}
        pipelineRunId={pipelineRunId}
        rawImages={rawImages}
        processedImages={processedImages}
        maskImages={maskImages}
      />
      {uploadedVideo?.id && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink dark:text-slate-100">
                So sánh OpenSfM
              </h3>

              <p className="mt-1 text-xs text-steel dark:text-slate-400">
                Raw flow dùng raw images + mask rỗng. Processed flow dùng
                processed images + mask thật tương ứng.
              </p>

              <p className="mt-2 text-xs text-steel dark:text-slate-400">
                Raw: {rawImages.length} | Processed: {processedImages.length} |
                Masks: {maskImages.length}
              </p>
            </div>

            <button
              type="button"
              onClick={onRunOpenSfMComparison}
              disabled={!canRunOpenSfM || isRunningOpenSfM}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunningOpenSfM
                ? "Đang chạy OpenSfM..."
                : "Chạy so sánh OpenSfM"}
            </button>
          </div>

          {!canRunOpenSfM ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Cần có raw images, processed images và số lượng processed images
              phải bằng số lượng masks.
            </div>
          ) : null}
        </div>
      )}
      {opensfmResult ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink dark:text-slate-100">
                    file1_raw.ply
                  </h3>
                  <p className="mt-1 text-xs text-steel dark:text-slate-400">
                    Raw images + mask rỗng
                  </p>
                </div>

                {rawPlyUrl ? (
                  <a
                    href={rawPlyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Tải PLY
                  </a>
                ) : null}
              </div>

              {rawPlyUrl ? (
                <div className="h-[420px] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <PointCloudViewer plyUrl={rawPlyUrl} />
                </div>
              ) : (
                <p className="text-sm text-steel dark:text-slate-400">
                  Không có file PLY raw.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink dark:text-slate-100">
                    file2_processed.ply
                  </h3>
                  <p className="mt-1 text-xs text-steel dark:text-slate-400">
                    Processed images + mask thật
                  </p>
                </div>

                {processedPlyUrl ? (
                  <a
                    href={processedPlyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Tải PLY
                  </a>
                ) : null}
              </div>

              {processedPlyUrl ? (
                <div className="h-[420px] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <PointCloudViewer plyUrl={processedPlyUrl} />
                </div>
              ) : (
                <p className="text-sm text-steel dark:text-slate-400">
                  Không có file PLY processed.
                </p>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-ink dark:text-slate-100">
                Kết quả đánh giá chất lượng
              </h3>

              <p className="mt-1 text-xs text-steel dark:text-slate-400">
                Compare run: {opensfmResult.compareRunId}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-steel dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Tiêu chí</th>
                    <th className="px-4 py-3">Raw flow</th>
                    <th className="px-4 py-3">Processed flow</th>
                    <th className="px-4 py-3">Chênh lệch</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-4 py-3 font-medium text-ink dark:text-slate-100">
                      Ảnh tái dựng
                    </td>
                    <td className="px-4 py-3 text-steel dark:text-slate-300">
                      {formatNumber(
                        opensfmResult.rawFlow.metrics.reconstructedImages,
                      )}
                    </td>
                    <td className="px-4 py-3 text-steel dark:text-slate-300">
                      {formatNumber(
                        opensfmResult.processedFlow.metrics.reconstructedImages,
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink dark:text-slate-100">
                      {formatNumber(
                        opensfmResult.comparison.reconstructedImageGain,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-medium text-ink dark:text-slate-100">
                      Sparse points
                    </td>
                    <td className="px-4 py-3 text-steel dark:text-slate-300">
                      {formatNumber(
                        opensfmResult.rawFlow.metrics.sparsePointCount,
                      )}
                    </td>
                    <td className="px-4 py-3 text-steel dark:text-slate-300">
                      {formatNumber(
                        opensfmResult.processedFlow.metrics.sparsePointCount,
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink dark:text-slate-100">
                      {formatPercent(
                        opensfmResult.comparison.sparsePointGainPercent,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-medium text-ink dark:text-slate-100">
                      Dense points
                    </td>
                    <td className="px-4 py-3 text-steel dark:text-slate-300">
                      {formatNumber(
                        opensfmResult.rawFlow.metrics.densePointCount,
                      )}
                    </td>
                    <td className="px-4 py-3 text-steel dark:text-slate-300">
                      {formatNumber(
                        opensfmResult.processedFlow.metrics.densePointCount,
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink dark:text-slate-100">
                      {formatPercent(
                        opensfmResult.comparison.densePointGainPercent,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-medium text-ink dark:text-slate-100">
                      Reprojection error
                    </td>
                    <td className="px-4 py-3 text-steel dark:text-slate-300">
                      {formatError(
                        opensfmResult.rawFlow.metrics.avgReprojectionError,
                      )}
                    </td>
                    <td className="px-4 py-3 text-steel dark:text-slate-300">
                      {formatError(
                        opensfmResult.processedFlow.metrics
                          .avgReprojectionError,
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink dark:text-slate-100">
                      {formatPercent(
                        opensfmResult.comparison
                          .reprojectionErrorImprovementPercent,
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
