import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  LatestProjectPipelineResponse,
  ProjectAssetsResponse,
  ProjectDetailResponse,
} from "@/types/dtos/project/project-detail.dto";
import {
  PaginatedResponse,
  ProjectListItemDto,
} from "@/types/dtos/project/project.dto";

export type GetProjectsQuery = {
  scope: "public" | "mine";
  page?: number;
  limit?: number;
  userId?: string;
};

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getProjectById: builder.query<
      ProjectListItemDto,
      {
        id: string;
        userId?: string;
      }
    >({
      query: ({ id, userId }) => {
        const params = new URLSearchParams();

        if (userId) {
          params.set("userId", userId);
        }

        const suffix = params.toString();

        return {
          url: `/projects/${id}${suffix ? `?${suffix}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (_result, _error, { id }) => [{ type: "Project", id }],
    }),
    getProjects: builder.query<
      PaginatedResponse<ProjectListItemDto>,
      GetProjectsQuery
    >({
      query: ({ scope, page = 1, limit = 12, userId }) => {
        const params = new URLSearchParams();

        params.set("scope", scope);
        params.set("page", String(page));
        params.set("limit", String(limit));

        if (userId) {
          params.set("userId", userId);
        }

        return {
          url: `/projects?${params.toString()}`,
          method: "GET",
        };
      },
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
    updateProjectVisibility: builder.mutation<
      {
        success: boolean;
        project?: {
          id: string;
          visibility: "public" | "private";
          updatedAt: string;
        };
      },
      {
        id: string;
        userId: string;
        visibility: "public" | "private";
      }
    >({
      query: ({ id, userId, visibility }) => ({
        url: `/projects/${id}/visibility?userId=${encodeURIComponent(userId)}`,
        method: "PATCH",
        body: {
          visibility,
        },
      }),
    }),
  }),
});

export const {
  useGetProjectByIdQuery,
  useGetProjectAssetsQuery,
  useGetLatestProjectPipelineQuery,
  useGetProjectsQuery,
  useUpdateProjectVisibilityMutation,
} = projectApi;
