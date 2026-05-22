"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { getCurrentUser } from "@/lib/auth-storage";
import { useAppStore } from "@/store/useAppStore";
import {
  useExtractFramesMutation,
  useUploadVideoMutation,
} from "@/services/video/video.service";

import {
  ImageAsset,
  ProcessingStage,
  UploadedVideoState,
} from "./_components/types";
import { PipelineFlowBoard } from "./_components/PipelineFlowBoard";
import { ProjectUploadPanel } from "./_components/ProjectUploadPanel";
import { PipelineStatusCard } from "./_components/PipelineStatusCard";
import {
  getErrorMessage,
  mapMaskFramesToImages,
  mapProcessedFramesToImages,
  mapRawFramesToImages,
} from "./_components/utils";

export default function ProjectsPage() {
  const t = useTranslations("projects");

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

  const setJobStatus = useAppStore((state) => state.setJobStatus);

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
        status: response.pipelineRun.status,
        stage: response.pipelineRun.stage,
        progress: response.pipelineRun.progress,
      });

      setRawImages(mapRawFramesToImages(response.rawImages));
      setProcessedImages(mapProcessedFramesToImages(response.processedImages));
      setMaskImages(mapMaskFramesToImages(response.masks));

      if (response.totalMasks > 0) {
        setProcessingStage("ready");
      } else if (response.totalProcessedImages > 0) {
        setProcessingStage("processed_completed");
      } else {
        setProcessingStage("raw_completed");
      }

      setMessage(
        `Đã cắt frame thành công. Raw images: ${response.totalRawImages}`,
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setMessage(errorMessage || "Không thể cắt frame từ video.");
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
