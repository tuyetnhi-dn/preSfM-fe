export type StorageUploadDto = {
  id?: string;
  storageFileId?: string;
  bucket?: string;
  path?: string;
  objectPath?: string;
  url?: string;
};

export type OpenSfMFlowMetricsDto = {
  reconstructionCount: number;
  reconstructedImages: number;
  sparsePointCount: number;
  densePointCount: number;
  avgReprojectionError: number | null;
  plyPath: string | null;
  statsPath: string | null;
  reportPath: string | null;
  reconstructionPath: string | null;
};

export type OpenSfMFlowResultDto = {
  name: "raw_flow" | "processed_flow" | string;
  datasetPath: string;
  imageCount: number;
  ply: StorageUploadDto | null;
  report: StorageUploadDto | null;
  metrics: OpenSfMFlowMetricsDto;
};

export type OpenSfMComparisonDto = {
  rawReconstructedImages: number;
  processedReconstructedImages: number;
  reconstructedImageGain: number;
  rawSparsePointCount: number;
  processedSparsePointCount: number;
  sparsePointGainPercent: number | null;
  rawDensePointCount: number;
  processedDensePointCount: number;
  densePointGainPercent: number | null;
  rawAvgReprojectionError: number | null;
  processedAvgReprojectionError: number | null;
  reprojectionErrorImprovementPercent: number | null;
  conclusion: "processed_flow_better" | "needs_manual_review" | string;
};

export type RunOpenSfMComparisonBody = {
  pipelineRunId?: string;
  runDense?: boolean;
};

export type RunOpenSfMComparisonResponse = {
  compareRunId: string;
  rawFlow: OpenSfMFlowResultDto;
  processedFlow: OpenSfMFlowResultDto;
  comparison: OpenSfMComparisonDto;
};
