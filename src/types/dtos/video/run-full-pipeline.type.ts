import type { RunOpenSfMComparisonResponse } from "./opensfm.dto";

export type RunFullPipelineBody = {
  sampleFps?: number;
  blurThreshold?: number;
  noiseThreshold?: number;
  runDense?: boolean;
  mode?: "quick" | "balanced" | "quality";
};

export type RunFullPipelineResponse = {
  message: string;
  videoId: string;
  pipelineRunId: string;
  jobId: string;
};

export type PipelineRunStatus =
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type PipelineRunStatusResponse = {
  id: string;
  videoId: string | null;
  datasetId: string | null;
  status: PipelineRunStatus | string;
  progress: number | null;
  currentStage: string | null;
  config: Record<string, unknown> | null;
  result: RunOpenSfMComparisonResponse | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
};
