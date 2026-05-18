"use client";

import { ChangeEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useDataset } from "@/hooks/useDataset";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { VideoPreview } from "./components/VideoPreview";
import { VideoDropZone } from "./components/VideoDropZone";
import { UploadProgress } from "./components/UploadProgress";

export default function ProjectsPage() {
  const t = useTranslations("projects");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const { uploadVideo, uploadProgress, loading } = useDataset();
  const setJobStatus = useAppStore((state) => state.setJobStatus);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  };

  const onUpload = async () => {
    if (!file) return;
    try {
      const response = await uploadVideo(file);
      const jobId = response.data.jobId;
      setJobStatus({
        id: jobId,
        status: "queued",
        stage: "video-upload",
        progress: 0,
      });
      setMessage(`${t("uploaded")}: ${jobId}`);
    } catch {
      setMessage(t("uploadFailed"));
    }
  };

  return (
    <section className="mx-auto max-w-3xl card p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold dark:text-slate-100">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-steel dark:text-slate-300">
          {t("subtitle")}
        </p>
      </div>
      <div>
        {file ? (
          <VideoPreview file={file} onRemove={() => setFile(null)} />
        ) : (
          <VideoDropZone onFileSelect={setFile} />
        )}

        {loading && <UploadProgress progress={uploadProgress} />}

        <button
          onClick={onUpload}
          disabled={!file || loading}
          className="w-full bg-brand hover:bg-brand-dark text-white text-sm font-medium mt-4 hover:pointer rounded-lg px-4 py-2 transition"
        >
          {loading ? t("uploading") : t("uploadButton")}
        </button>

        {message && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
