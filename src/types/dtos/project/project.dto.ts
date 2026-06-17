export type ProjectVisibility = "public" | "private";

export type LatestPipelineDto = {
  id: string;
  status: string;
  progress: number | null;
  currentStage: string | null;
  createdAt: string;
  updatedAt: string;
} | null;

export type ProjectListItemDto = {
  id: string;
  userId?: string;
  name: string;
  description: string | null;
  visibility: ProjectVisibility;
  status: string;

  datasetId?: string | null;
  videoId?: string | null;
  coverImageUrl: string | null;

  videoUrl: string | null;
  videoOriginalName: string | null;
  videoMimeType: string | null;
  videoSizeBytes: number | null;

  createdAt: string;
  updatedAt: string;
  latestPipeline: LatestPipelineDto;
};

export type PaginatedResponse<T> = {
  items: T[];

  page: number;
  limit: number;

  total: number;
  totalPages: number;

  hasNextPage: boolean;
};
