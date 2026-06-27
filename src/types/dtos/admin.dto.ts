export type AdminTopUserDto = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  status: string;
  projectCount: number;
  datasetCount: number;
  videoCount: number;
  pipelineRunCount: number;
  storageFileCount: number;
  storageBytes: number;
};

export type AdminStatsDto = {
  totalUsers: number;
  activeUsers: number;

  totalProjects: number;
  publicProjects: number;
  privateProjects: number;

  totalDatasets: number;
  totalVideos: number;

  totalPipelines: number;
  pendingPipelines: number;
  runningPipelines: number;
  completedPipelines: number;
  failedPipelines: number;

  totalStorageBytes: number;

  topUsers: AdminTopUserDto[];
};

export type AdminUserListItemDto = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  status: string;
  projectCount: number;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type GetAdminUsersParams = {
  page?: number;
  limit?: number;
  email?: string;
  role?: string;
  status?: string;
};

export type UpdateAdminUserStatusRequest = {
  userId: string;
  status: "active" | "blocked";
};

export type UpdateAdminUserStatusResponse = {
  message?: string;
  user: AdminUserListItemDto;
};
export type AdminUserProjectItemDto = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  visibility: string;
  datasetCount: number;
  videoCount: number;
  pipelineRunCount: number;
  failedPipelineCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserDetailDto = {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    projectCount: number;
    datasetCount: number;
    videoCount: number;
    pipelineRunCount: number;
    failedPipelineCount: number;
  };
  projects: PaginatedResponse<AdminUserProjectItemDto>;
};

export type GetAdminUserDetailParams = {
  userId: string;
  page?: number;
  limit?: number;
};

export type AdminProjectDetailDto = {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    visibility: string;
    createdAt: string;
    updatedAt: string;
    owner: {
      id: string;
      email: string;
      fullName: string | null;
    };
    datasetCount: number;
    videoCount: number;
    pipelineRunCount: number;
    failedPipelineCount: number;
  };
  datasets: {
    id: string;
    createdAt: string;
  }[];
  videos: {
    id: string;
    datasetId: string;
    storageFileId: string;
  }[];
  pipelines: {
    id: string;
    datasetId: string | null;
    videoId: string | null;
    projectId: string | null;
    status: string;
    progress: number;
    pipelineType: string | null;
    stage: string | null;
    currentStage: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
};
export type AdminProjectListItemDto = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  visibility: string;
  owner: {
    id: string;
    email: string;
    fullName: string | null;
  };
  datasetCount: number;
  videoCount: number;
  pipelineRunCount: number;
  failedPipelineCount: number;
  createdAt: string;
  updatedAt?: string;
};

export type GetAdminProjectsParams = {
  page?: number;
  limit?: number;
  search?: string;
  visibility?: string;
  status?: string;
};
