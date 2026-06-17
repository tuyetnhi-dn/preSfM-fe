import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { JobStatus, Project, UserProfile } from "@/types";

export type GlobalPipelineStatus =
  | "idle"
  | "processing"
  | "completed"
  | "failed";

interface AppState {
  user: UserProfile | null;
  token: string | null;
  currentProject: Project | null;
  jobStatus: JobStatus | null;

  pipelineRunId: string | null;
  pipelineVideoId: string | null;
  pipelineStatus: GlobalPipelineStatus;

  setAuth: (user: UserProfile, token: string) => void;
  clearAuth: () => void;
  setCurrentProject: (project: Project) => void;
  setJobStatus: (jobStatus: JobStatus) => void;

  setPipelineProcessing: (payload: {
    pipelineRunId: string;
    videoId: string;
  }) => void;
  setPipelineCompleted: () => void;
  setPipelineFailed: () => void;
  clearPipeline: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentProject: null,
      jobStatus: null,

      pipelineRunId: null,
      pipelineVideoId: null,
      pipelineStatus: "idle",

      setAuth: (user, token) => set({ user, token }),
      clearAuth: () =>
        set({
          user: null,
          token: null,
        }),
      setCurrentProject: (project) => set({ currentProject: project }),
      setJobStatus: (jobStatus) => set({ jobStatus }),

      setPipelineProcessing: ({ pipelineRunId, videoId }) =>
        set({
          pipelineRunId,
          pipelineVideoId: videoId,
          pipelineStatus: "processing",
        }),

      setPipelineCompleted: () =>
        set({
          pipelineStatus: "completed",
        }),

      setPipelineFailed: () =>
        set({
          pipelineStatus: "failed",
        }),

      clearPipeline: () =>
        set({
          pipelineRunId: null,
          pipelineVideoId: null,
          pipelineStatus: "idle",
        }),
    }),
    {
      name: "presfm-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        currentProject: state.currentProject,
        pipelineRunId: state.pipelineRunId,
        pipelineVideoId: state.pipelineVideoId,
        pipelineStatus: state.pipelineStatus,
      }),
    },
  ),
);
