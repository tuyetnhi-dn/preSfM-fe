import type { RunOpenSfMComparisonResponse } from "@/types/dtos/video/opensfm.dto";
import type { ImageAssetItem } from "@/types/dtos/video/video.dto";
import { PipelineRunStatusResponse } from "../video/run-full-pipeline.type";

export type ProjectDetailResponse = {
  id: string;
  name: string;
  status?: string | null;
  datasetId?: string | null;
  videoId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectAssetVideoDto = {
  id: string;
  datasetId: string;
  originalName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  url: string | null;
};
export type ProjectAssetsResponse = {
  video?: ProjectAssetVideoDto | null;
  rawImages?: ImageAssetItem[];
  processedImages?: ImageAssetItem[];
  masks?: ImageAssetItem[];
  folders?: {
    rawImages?: ImageAssetItem[];
    processedImages?: ImageAssetItem[];
    masks?: ImageAssetItem[];
  };
};

export type LatestProjectPipelineResponse = PipelineRunStatusResponse | null;

export type ProjectResult = RunOpenSfMComparisonResponse | null;
export type Vec3 = [number, number, number];

export type PlyViewpoint = {
  frameName: string;
  position: Vec3;
  target: Vec3;
  up: Vec3;
  rotation: Vec3;
  translation: Vec3;
};

export type PlyViewerFrame = {
  frameId: string;
  frameIndex: number;
  frameName: string;
  timestampMs: number;
  rawImageUrl: string | null;
  processedImageUrl: string | null;
  maskUrl: string | null;
  rawViewpoint: PlyViewpoint | null;
  processedViewpoint: PlyViewpoint | null;
};

export type ProjectPlyViewerAssetsResponse = {
  video: {
    id: string;
    url: string | null;
    fps: number | null;
    durationMs: number | null;
    width: number | null;
    height: number | null;
    originalName: string | null;
  } | null;

  pointClouds: {
    rawPlyUrl: string | null;
    processedPlyUrl: string | null;
    rawPlyFileId: string | null;
    processedPlyFileId: string | null;
  };

  frames: PlyViewerFrame[];
};
