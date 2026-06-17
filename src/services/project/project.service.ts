import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  LatestProjectPipelineResponse,
  ProjectAssetsResponse,
  ProjectDetailResponse,
} from "@/types/dtos/project/project-detail.dto";

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getProjectById: builder.query<ProjectDetailResponse, string>({
      query: (projectId) => `/projects/${projectId}`,
      providesTags: (_result, _error, projectId) => [
        { type: "Project", id: projectId },
      ],
    }),

    getProjectAssets: builder.query<ProjectAssetsResponse, string>({
      query: (projectId) => `/projects/${projectId}/assets`,
      providesTags: (_result, _error, projectId) => [
        { type: "Project", id: `${projectId}-assets` },
      ],
    }),

    getLatestProjectPipeline: builder.query<
      LatestProjectPipelineResponse,
      string
    >({
      query: (projectId) => `/projects/${projectId}/latest-pipeline`,
      providesTags: (_result, _error, projectId) => [
        { type: "Project", id: `${projectId}-latest-pipeline` },
      ],
    }),
  }),
});

export const {
  useGetProjectByIdQuery,
  useGetProjectAssetsQuery,
  useGetLatestProjectPipelineQuery,
} = projectApi;
