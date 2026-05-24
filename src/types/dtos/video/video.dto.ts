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

export type PipelineStatusDto =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | string;

export type PipelineRunDto = {
  id: string;
  datasetId: string;
  videoId: string;
  status: PipelineStatusDto;
  progress: number;
  config?: Record<string, unknown>;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  pipelineType?: "raw" | "processed" | string;
  stage?: string;
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

export type StorageAssetDto = {
  storageFileId: string;
  bucket: string | null;
  path: string | null;
  url: string;
};

export type ImageAssetItem = {
  id: string;
  frameIndex: number;
  timestampMs: number | null;
  width: number | null;
  height: number | null;
  blurScore: number | null;
  noiseScore: number | null;
  isSelected: boolean;
  rejectedReason: string | null;
  raw?: StorageAssetDto | null;
  processed?: StorageAssetDto | null;
  mask?: StorageAssetDto | null;
};

export type VideoAssetsResponse = {
  videoId: string;
  folders?: {
    rawImages: ImageAssetItem[];
    processedImages: ImageAssetItem[];
    masks: ImageAssetItem[];
  };
  rawImages: ImageAssetItem[];
  processedImages: ImageAssetItem[];
  masks: ImageAssetItem[];
  totalRawImages: number;
  totalProcessedImages: number;
  totalMasks: number;
};

export type PreprocessAndGenerateMasksBody = {
  pipelineRunId?: string;
  config?: {
    blurThreshold?: number;
    noiseThreshold?: number;
    outputProcessedFolder?: string;
    outputMaskFolder?: string;
  };
};

export type ExtractFramesResponse = VideoAssetsResponse & {
  pipelineRun: PipelineRunDto;
};
export type PreprocessAndGenerateMasksResponse = VideoAssetsResponse & {
  pipelineRun: PipelineRunDto;
  total: number;
  selectedCount: number;
  rejectedCount: number;
  images: Array<{
    frameId: string;
    frameIndex: number;
    blurScore: number | null;
    noiseScore: number | null;
    isSelected: boolean;
    rejectedReason: string | null;
    processedStorageFileId: string | null;
    maskStorageFileId: string | null;
  }>;
};
