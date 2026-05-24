"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { getCurrentUser } from "@/lib/auth-storage";
import { useAppStore } from "@/store/useAppStore";
import {
  useExtractFramesMutation,
  useGetVideoAssetsQuery,
  usePreprocessAndGenerateMasksMutation,
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
import { PipelineFlowBoard } from "./_components/PipelineFlowBoard";
import { ProjectUploadPanel } from "./_components/ProjectUploadPanel";
import {
  getErrorMessage,
  mapMaskFramesToImages,
  mapProcessedFramesToImages,
  mapRawFramesToImages,
} from "./_components/utils";

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

  const [uploadVideo, { isLoading: isUploading }] = useUploadVideoMutation();

  const [extractFrames, { isLoading: isExtracting }] =
    useExtractFramesMutation();

  const [preprocessAndGenerateMasks, { isLoading: isPreprocessing }] =
    usePreprocessAndGenerateMasksMutation();

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
    </section>
  );
}
