import { PROJECT_LOCAL_STORAGE_KEY } from "../_constants/project-storage-key";
import type { UploadedVideoState } from "../_components/types";
import type { RunOpenSfMComparisonResponse } from "@/types/dtos/video/opensfm.dto";

export type StoredFullPipelineState = {
  projectName: string;
  uploadedVideo: UploadedVideoState | null;
  pipelineRunId: string;
  pipelineStatus: "idle" | "uploading" | "processing" | "completed" | "failed";
  opensfmResult: RunOpenSfMComparisonResponse | null;
};

export function getStoredFullPipeline(): StoredFullPipelineState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PROJECT_LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(PROJECT_LOCAL_STORAGE_KEY);
    return null;
  }
}

export function saveStoredFullPipeline(
  state: Partial<StoredFullPipelineState>,
) {
  if (typeof window === "undefined") return;

  const oldState = getStoredFullPipeline() ?? {
    projectName: "",
    uploadedVideo: null,
    pipelineRunId: "",
    pipelineStatus: "idle",
    opensfmResult: null,
  };

  localStorage.setItem(
    PROJECT_LOCAL_STORAGE_KEY,
    JSON.stringify({
      ...oldState,
      ...state,
    }),
  );
}

export function clearStoredFullPipeline() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(PROJECT_LOCAL_STORAGE_KEY);
}
