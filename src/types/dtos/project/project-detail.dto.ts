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
