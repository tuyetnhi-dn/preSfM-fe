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
  config?: {
    outputRawFolder?: string;
    outputMaskFolder?: string;
    outputProcessedFolder?: string;
    [key: string]: unknown;
  };
};

export type ExtractFramesBodyType = {
  id: string;
  body: CreatePipelineBodyType;
};

export type PipelineRunDto = {
  id: string;
  datasetId: string;
  videoId: string;
  status: string;
  progress: number;
  pipelineType: PipelineType;
};

export type FrameStorageAssetDto = {
  storageFileId: string;
  bucket: string;
  path: string;
  url: string;
};

export type FrameImageDto = {
  id: string;
  frameIndex: number;
  timestampMs: number;
  width: number;
  height: number;
  raw: FrameStorageAssetDto | null;
  processed: FrameStorageAssetDto | null;
  mask: FrameStorageAssetDto | null;
};

export type ExtractFramesResType = {
  pipelineRun: PipelineRunDto;
  rawImages: FrameImageDto[];
  processedImages: FrameImageDto[];
  masks: FrameImageDto[];
  totalRawImages: number;
  totalProcessedImages: number;
  totalMasks: number;
};

export type DeleteVideoResType = {
  success: boolean;
  deletedVideoId: string;
};
