"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

import { getCurrentUser } from "@/lib/auth-storage";
import {
  useRunFullPipelineMutation,
  useUploadVideoMutation,
} from "@/services/video/video.service";
import { usePipelineStore } from "@/store/pipeline-store";

import { ProjectUploadPanel } from "../_components/upload/ProjectUploadPanel";
import type { UploadedVideoState } from "../_components/types";
import { getErrorMessage } from "../_components/utils";

type ProjectVisibility = "public" | "private";

export default function CreateProjectPage() {
  const t = useTranslations("projects");
  const router = useRouter();
  const params = useParams();

  const locale = params.locale as string;

  const addPipeline = usePipelineStore((s) => s.addPipeline);

  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [datasetName, setDatasetName] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>("private");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideoState | null>(
    null,
  );

  const [uploadVideo, { isLoading: isUploading }] = useUploadVideoMutation();
  const [runFullPipeline, { isLoading: isStartingPipeline }] =
    useRunFullPipelineMutation();

  const onUpload = async () => {
    if (!file) {
      setMessage("Vui lòng chọn video.");
      return;
    }

    if (!projectName.trim()) {
      setMessage(t("projectNameRequired"));
      return;
    }

    const currentUser = getCurrentUser();

    if (!currentUser?.id) {
      setMessage(t("invalidSession"));
      return;
    }

    try {
      setMessage("");
      setUploadProgress(0);

      const uploaded = await uploadVideo({
        file,
        uploadedBy: currentUser.id,
        projectName: projectName.trim(),
        description: description.trim(),
        visibility,
        datasetName: datasetName.trim() || projectName.trim(),
        onProgress: setUploadProgress,
      }).unwrap();

      const nextVideo: UploadedVideoState = {
        id: uploaded.id,
        datasetId: uploaded.datasetId,
        projectId: uploaded.projectId,
        originalName: uploaded.originalName,
      };

      setUploadedVideo(nextVideo);

      const pipeline = await runFullPipeline({
        videoId: uploaded.id,
        body: {
          sampleFps: 2,
          blurThreshold: 100,
          noiseThreshold: 25,
          runDense: true,
          mode: "balanced",
        },
      }).unwrap();

      localStorage.setItem(
        `presfm:pipeline-run:${uploaded.id}`,
        pipeline.pipelineRunId,
      );

      addPipeline({
        projectId: uploaded.projectId,
        videoId: uploaded.id,
        pipelineRunId: pipeline.pipelineRunId,
        status: "running",
        progress: 0,
        currentStage: "queued",
      });

      toast.success("Pipeline đã bắt đầu chạy nền.");

      router.push(`/${locale}/projects/${uploaded.projectId}`);
    } catch (error) {
      const errorMessage = getErrorMessage(error) || t("uploadFailed");
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isBusy = isUploading || isStartingPipeline;

  return (
    <section className="mx-auto max-w-6xl card p-6 sm:p-8">
      <ProjectUploadPanel
        title="Tạo project mới"
        subtitle="Upload video, bổ sung metadata và khởi chạy pipeline xử lý nền."
        projectNameLabel={t("projectName")}
        projectNamePlaceholder={t("projectNamePlaceholder")}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        descriptionLabel="Mô tả project"
        descriptionPlaceholder="Ví dụ: Video test tái dựng cảnh đường phố, quay bằng điện thoại..."
        description={description}
        onDescriptionChange={setDescription}
        datasetNameLabel="Tên dataset"
        datasetNamePlaceholder="Nếu bỏ trống sẽ dùng tên project"
        datasetName={datasetName}
        onDatasetNameChange={setDatasetName}
        visibilityLabel="Chế độ hiển thị"
        visibility={visibility}
        onVisibilityChange={setVisibility}
        file={file}
        onFileSelect={setFile}
        onRemoveFile={() => setFile(null)}
        message={message}
        uploadProgress={uploadProgress}
        uploadedVideo={uploadedVideo}
        processingStage={isBusy ? "extracting" : "idle"}
        isUploading={isBusy}
        isExtracting={false}
        uploadButtonLabel={
          isBusy ? "Đang xử lý..." : "Tạo project và chạy pipeline"
        }
        nextButtonLabel={undefined}
        onUpload={onUpload}
        onNextStep={undefined}
      />
    </section>
  );
}
