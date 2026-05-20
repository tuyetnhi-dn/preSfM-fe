"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useAppStore } from "@/store/useAppStore";
import { useUploadVideoMutation } from "@/services/video/video.service";

import { VideoPreview } from "./components/VideoPreview";
import { VideoDropZone } from "./components/VideoDropZone";
import { UploadProgress } from "./components/UploadProgress";
import { getCurrentUser } from "@/lib/auth-storage";
import Loader from "@/components/ui/loader";

type StoredUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  status: string;
};

function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user) as StoredUser;
  } catch {
    return null;
  }
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;

    if (typeof data === "object" && data !== null) {
      const message = (data as { message?: unknown }).message;
      const errorMessage = (data as { error?: unknown }).error;

      if (typeof message === "string") return message;
      if (Array.isArray(message)) return message.join(", ");
      if (typeof errorMessage === "string") return errorMessage;
    }

    if (typeof data === "string") return data;
  }

  return "";
}

export default function ProjectsPage() {
  const t = useTranslations("projects");

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadVideo, { isLoading }] = useUploadVideoMutation();

  const setJobStatus = useAppStore((state) => state.setJobStatus);

  const onUpload = async () => {
    if (!file) return;

    setMessage("");
    setUploadProgress(0);

    const currentUser = getCurrentUser();

    if (!currentUser?.id) {
      setMessage("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const response = await uploadVideo({
        file,
        uploadedBy: currentUser.id,
        onProgress: setUploadProgress,
      }).unwrap();

      setJobStatus({
        id: response.id,
        status: "queued",
        stage: "video-upload",
        progress: 100,
      });

      setMessage(`${t("uploaded")}: ${response.id}`);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setMessage(errorMessage || t("uploadFailed"));
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

        {isLoading && <UploadProgress progress={uploadProgress} />}

        <button
          onClick={onUpload}
          disabled={!file || isLoading}
          className="w-full bg-brand flex items-center justify-center hover:bg-brand-dark text-white text-sm font-medium mt-4 hover:pointer rounded-lg px-4 py-2 transition"
        >
          {isLoading ? <Loader /> : t("uploadButton")}
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
