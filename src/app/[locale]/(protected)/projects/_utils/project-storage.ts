import { PROJECT_LOCAL_STORAGE_KEY } from "../_constants/project-storage-key";

export type StoredProjectState = {
  uploadedVideo: any | null;
  projectName: string;
  pipelineRunId: string;
  processingStage: string;
  opensfmResult: any | null;
};

const defaultState: StoredProjectState = {
  uploadedVideo: null,
  projectName: "",
  pipelineRunId: "",
  processingStage: "idle",
  opensfmResult: null,
};

export function getStoredProject(): StoredProjectState | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(PROJECT_LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(PROJECT_LOCAL_STORAGE_KEY);
    return null;
  }
}

export function saveStoredProject(state: Partial<StoredProjectState>) {
  if (typeof window === "undefined") return;

  const oldState = getStoredProject() ?? defaultState;

  localStorage.setItem(
    PROJECT_LOCAL_STORAGE_KEY,
    JSON.stringify({
      ...oldState,
      ...state,
    }),
  );
}

export function clearStoredProject() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(PROJECT_LOCAL_STORAGE_KEY);
}
