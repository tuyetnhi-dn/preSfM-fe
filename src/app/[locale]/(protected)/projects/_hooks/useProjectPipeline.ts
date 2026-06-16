"use client";

import { useEffect, useState } from "react";
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
import type { RunOpenSfMComparisonResponse } from "@/types/dtos/video/opensfm.dto";

import type {
  ImageAsset,
  ProcessingStage,
  UploadedVideoState,
} from "../_components/types";

import {
  getErrorMessage,
  mapMaskFramesToImages,
  mapProcessedFramesToImages,
  mapRawFramesToImages,
} from "../_components/utils";

const PROJECT_LOCAL_KEY = "presfm_current_project";

type UiJobStatus = "queued" | "processing" | "completed" | "failed";

type StoredProjectState = {
  uploadedVideo: UploadedVideoState | null;
  projectName: string;
  pipelineRunId: string;
  processingStage: ProcessingStage;
  opensfmResult: RunOpenSfMComparisonResponse | null;
};

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
    // ensure optional asset refs are explicit null when missing to match expected types
    raw: (item as any).raw ?? null,
    processed: (item as any).processed ?? null,
    mask: (item as any).mask ?? null,
  }));
}

export function useProjectPipeline() {
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

  const saveLocalProject = (state: Partial<StoredProjectState>) => {
    const current = localStorage.getItem(PROJECT_LOCAL_KEY);

    const oldState: StoredProjectState = current
      ? JSON.parse(current)
      : {
          uploadedVideo: null,
          projectName: "",
          pipelineRunId: "",
          processingStage: "idle",
          opensfmResult: null,
        };

    localStorage.setItem(
      PROJECT_LOCAL_KEY,
      JSON.stringify({
        ...oldState,
        ...state,
      }),
    );
  };

  const onClearLocalProject = () => {
    localStorage.removeItem(PROJECT_LOCAL_KEY);
    setFile(null);
    setProjectName("");
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

    setRawImages(mapRawFramesToImages(normalizeFrameItems(nextRawImages)));
    setProcessedImages(
      mapProcessedFramesToImages(normalizeFrameItems(nextProcessedImages)),
    );
    setMaskImages(mapMaskFramesToImages(normalizeFrameItems(nextMasks)));

    const totalMasks = data.totalMasks ?? nextMasks.length;
    const totalProcessedImages =
      data.totalProcessedImages ?? nextProcessedImages.length;
    const totalRawImages = data.totalRawImages ?? nextRawImages.length;

    let nextStage: ProcessingStage = "uploaded";

    if (totalMasks > 0) nextStage = "ready";
    else if (totalProcessedImages > 0) nextStage = "processed_completed";
    else if (totalRawImages > 0) nextStage = "raw_completed";

    setProcessingStage(nextStage);
    saveLocalProject({ processingStage: nextStage });
  };

  useEffect(() => {
    const saved = localStorage.getItem(PROJECT_LOCAL_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as StoredProjectState;

      setUploadedVideo(parsed.uploadedVideo);
      setProjectName(parsed.projectName ?? "");
      setPipelineRunId(parsed.pipelineRunId ?? "");
      setProcessingStage(parsed.processingStage ?? "uploaded");
      setOpensfmResult(parsed.opensfmResult ?? null);
    } catch {
      localStorage.removeItem(PROJECT_LOCAL_KEY);
    }
  }, []);

  useEffect(() => {
    if (!uploadedVideo?.id) return;

    refetchAssets().then((latestAssets) => {
      if (latestAssets.data) {
        applyAssetsToState(latestAssets.data);
      }
    });
  }, [uploadedVideo?.id]);

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

      const nextUploadedVideo: UploadedVideoState = {
        id: response.id,
        datasetId: response.datasetId,
        projectId: response.projectId,
        originalName: response.originalName,
      };

      setUploadedVideo(nextUploadedVideo);
      setProcessingStage("uploaded");

      saveLocalProject({
        uploadedVideo: nextUploadedVideo,
        projectName: projectName.trim(),
        processingStage: "uploaded",
        pipelineRunId: "",
        opensfmResult: null,
      });

      setJobStatus({
        id: response.id,
        status: "queued",
        stage: "video-upload",
        progress: 100,
      });

      setMessage(`${t("uploaded")}: ${response.originalName}`);
    } catch (error) {
      setMessage(getErrorMessage(error) || t("uploadFailed"));
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

      saveLocalProject({
        pipelineRunId: response.pipelineRun.id,
      });

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
      setMessage(getErrorMessage(error) || "Không thể cắt frame từ video.");
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
      setMessage(getErrorMessage(error) || "Không thể xử lý ảnh và tạo mask.");
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

      saveLocalProject({
        opensfmResult: response,
      });

      setMessage("Chạy OpenSfM comparison hoàn tất.");
    } catch (error) {
      setMessage(
        getErrorMessage(error) || "Không thể chạy OpenSfM comparison.",
      );
    }
  };

  const canRunOpenSfM =
    Boolean(uploadedVideo?.id) &&
    rawImages.length > 0 &&
    processedImages.length > 0 &&
    processedImages.length === maskImages.length;

  return {
    file,
    setFile,
    projectName,
    setProjectName,
    message,
    uploadProgress,
    uploadedVideo,
    processingStage,
    pipelineRunId,
    rawImages,
    processedImages,
    maskImages,
    opensfmResult,
    isUploading,
    isExtracting,
    isPreprocessing,
    isFetchingAssets,
    isRunningOpenSfM,
    canRunOpenSfM,
    onUpload,
    onNextStep,
    onPreprocessAndGenerateMasks,
    onRunOpenSfMComparison,
    onClearLocalProject,
  };
}
