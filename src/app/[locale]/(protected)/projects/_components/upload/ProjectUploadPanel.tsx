"use client";

import { WandSparkles } from "lucide-react";

import Loader from "@/components/ui/loader";

import { ProjectNameField } from "../pipeline/ProjectNameField";
import { VideoPreview } from "./VideoPreview";
import { VideoDropZone } from "./VideoDropZone";
import { UploadProgress } from "../common/UploadProgress";
import type { ProcessingStage, UploadedVideoState } from "../types";

type ProjectVisibility = "public" | "private";

type ProjectUploadPanelProps = {
  title: string;
  subtitle: string;

  projectNameLabel: string;
  projectNamePlaceholder: string;
  projectName: string;
  onProjectNameChange: (value: string) => void;

  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  description?: string;
  onDescriptionChange?: (value: string) => void;

  datasetNameLabel?: string;
  datasetNamePlaceholder?: string;
  datasetName?: string;
  onDatasetNameChange?: (value: string) => void;

  visibilityLabel?: string;
  visibility?: ProjectVisibility;
  onVisibilityChange?: (value: ProjectVisibility) => void;

  file: File | null;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;

  message: string;
  uploadProgress: number;

  uploadedVideo: UploadedVideoState | null;
  processingStage: ProcessingStage;

  isUploading: boolean;
  isExtracting: boolean;

  uploadButtonLabel: string;
  nextButtonLabel?: string;
  onUpload: () => void;
  onNextStep?: () => void;
};

export function ProjectUploadPanel({
  title,
  subtitle,
  projectNameLabel,
  projectNamePlaceholder,
  projectName,
  onProjectNameChange,

  descriptionLabel = "Mô tả project",
  descriptionPlaceholder = "Nhập mô tả ngắn cho project...",
  description = "",
  onDescriptionChange,

  datasetNameLabel = "Tên dataset",
  datasetNamePlaceholder = "Nếu bỏ trống sẽ dùng tên project",
  datasetName = "",
  onDatasetNameChange,

  visibilityLabel = "Chế độ hiển thị",
  visibility = "private",
  onVisibilityChange,

  file,
  onFileSelect,
  onRemoveFile,
  message,
  uploadProgress,
  uploadedVideo,
  processingStage,
  isUploading,
  isExtracting,
  uploadButtonLabel,
  nextButtonLabel,
  onUpload,
  onNextStep,
}: ProjectUploadPanelProps) {
  const isBusy = isUploading || isExtracting;
  const isUploadCompleted = Boolean(uploadedVideo);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold dark:text-slate-100">{title}</h1>

        <p className="mt-2 text-sm text-steel dark:text-slate-300">
          {subtitle}
        </p>
      </div>

      <ProjectNameField
        label={projectNameLabel}
        placeholder={projectNamePlaceholder}
        value={projectName}
        disabled={isBusy || isUploadCompleted}
        onChange={onProjectNameChange}
      />

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
          {descriptionLabel}
        </label>

        <textarea
          value={description}
          disabled={isBusy || isUploadCompleted}
          onChange={(event) => onDescriptionChange?.(event.target.value)}
          placeholder={descriptionPlaceholder}
          rows={4}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {/* <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
          {datasetNameLabel}
        </label>

        <input
          value={datasetName}
          disabled={isBusy || isUploadCompleted}
          onChange={(event) => onDatasetNameChange?.(event.target.value)}
          placeholder={datasetNamePlaceholder}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div> */}

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
          {visibilityLabel}
        </label>

        <select
          value={visibility}
          disabled={isBusy || isUploadCompleted}
          onChange={(event) =>
            onVisibilityChange?.(event.target.value as ProjectVisibility)
          }
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="private">Private - chỉ mình tôi xem</option>
          <option value="public">Public - hiển thị ở trang Home</option>
        </select>
      </div>

      <div className="mt-4">
        {file ? (
          <VideoPreview file={file} onRemove={onRemoveFile} />
        ) : (
          <VideoDropZone onFileSelect={onFileSelect} />
        )}
      </div>

      {isUploading && <UploadProgress progress={uploadProgress} />}

      {!uploadedVideo ? (
        <button
          onClick={onUpload}
          disabled={!file || !projectName.trim() || isBusy}
          className="mt-4 flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {isUploading ? <Loader /> : uploadButtonLabel}
        </button>
      ) : null}

      {uploadedVideo && processingStage === "uploaded" ? (
        <button
          onClick={onNextStep}
          disabled={isExtracting}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-brand bg-white px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/10 disabled:opacity-60 dark:bg-slate-900"
        >
          {isExtracting ? (
            <Loader />
          ) : (
            <>
              <WandSparkles className="h-4 w-4" />
              {nextButtonLabel}
            </>
          )}
        </button>
      ) : null}

      {message && (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
          {message}
        </p>
      )}
    </div>
  );
}
