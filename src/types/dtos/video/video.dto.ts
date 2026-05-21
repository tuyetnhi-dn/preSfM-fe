export type PipelineType = "raw" | "processed";

export type StorageFileType = {
  id: string;
  provider: string;
  bucket: string;
  objectPath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
};

export type UploadVideoBodyType = {
  file: File;
  datasetId?: string;
  uploadedBy?: string;
  projectName?: string;
  onProgress?: (progress: number) => void;
};

export type UploadVideoResType = {
  id: string;
  datasetId: string;
  projectId: string;
  storageFileId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  durationMs: number | null;
  fps: number | null;
  width: number | null;
  height: number | null;
  status: string;
  bucket?: string;
  objectPath?: string;
  createdAt: string;
  storageFile: StorageFileType;
};

export type VideoItemType = {
  id: string;
  datasetId: string;
  storageFileId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  durationMs?: number | null;
  fps?: number | null;
  width?: number | null;
  height?: number | null;
  status: string;
  bucket?: string;
  objectPath?: string;
  createdAt: string;
};

export type VideoMetadataResType = {
  id: string;
  durationMs: number | null;
  fps: number | null;
  width: number | null;
  height: number | null;
  mimeType: string;
  sizeBytes: number;
};

export type CreatePipelineBodyType = {
  pipelineType: PipelineType;
  sampleFps?: number;
  config?: Record<string, unknown>;
};

export type ExtractFramesBodyType = {
  id: string;
  body: CreatePipelineBodyType;
};

export type ExtractFramesResType = {
  id: string;
  dataset_id: string;
  video_id: string;
  status: string;
  progress: number;
  config: Record<string, unknown>;
  pipeline_type: PipelineType;
  created_at: string;
  updated_at?: string;
};

export type DeleteVideoResType = {
  success: boolean;
  deletedVideoId: string;
};
