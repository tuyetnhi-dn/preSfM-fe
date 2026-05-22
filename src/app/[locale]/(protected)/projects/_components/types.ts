export type UploadedVideoState = {
  id: string;
  datasetId: string;
  projectId: string;
  originalName: string;
};

export type ProcessingStage =
  | "idle"
  | "uploaded"
  | "extracting"
  | "raw_completed"
  | "processing"
  | "processed_completed"
  | "mask_completed"
  | "ready"
  | "failed";

export type ImageAsset = {
  id: string;
  name: string;
  url?: string;
  frameIndex?: number;
  timestampMs?: number;
  width?: number;
  height?: number;
};
