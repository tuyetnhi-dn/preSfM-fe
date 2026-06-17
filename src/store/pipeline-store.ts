import { create } from "zustand";

export type RunningPipeline = {
  projectId: string;
  videoId: string;
  pipelineRunId: string;
  status: string;
  progress: number;
  currentStage?: string;
};

type PipelineStore = {
  pipelines: RunningPipeline[];
  addPipeline: (pipeline: RunningPipeline) => void;
  updatePipeline: (
    pipelineRunId: string,
    data: Partial<RunningPipeline>,
  ) => void;
  removePipeline: (pipelineRunId: string) => void;
};

export const usePipelineStore = create<PipelineStore>((set) => ({
  pipelines: [],

  addPipeline: (pipeline) =>
    set((state) => ({
      pipelines: [
        ...state.pipelines.filter(
          (item) => item.pipelineRunId !== pipeline.pipelineRunId,
        ),
        pipeline,
      ],
    })),

  updatePipeline: (pipelineRunId, data) =>
    set((state) => ({
      pipelines: state.pipelines.map((item) =>
        item.pipelineRunId === pipelineRunId ? { ...item, ...data } : item,
      ),
    })),

  removePipeline: (pipelineRunId) =>
    set((state) => ({
      pipelines: state.pipelines.filter(
        (item) => item.pipelineRunId !== pipelineRunId,
      ),
    })),
}));
