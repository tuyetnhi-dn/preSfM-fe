import { createApi } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import axios from "axios";

import { HttpMethod } from "@/constants/http.enum";
import {
  DeleteVideoResType,
  ExtractFramesBodyType,
  ExtractFramesResponse,
  ExtractFramesResType,
  PreprocessAndGenerateMasksBody,
  PreprocessAndGenerateMasksResponse,
  UploadVideoBodyType,
  UploadVideoResType,
  VideoAssetsResponse,
  VideoItemType,
  VideoMetadataResType,
} from "@/types/dtos/video/video.dto";
import { backendBaseQuery } from "@/redux/services/client";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) return {};

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function toRtkQueryError(error: unknown): FetchBaseQueryError {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return {
        status: error.response.status,
        data: error.response.data,
      };
    }

    return {
      status: "FETCH_ERROR",
      error: error.message || "Network error",
    };
  }

  return {
    status: "CUSTOM_ERROR",
    error: "Unknown upload error",
  };
}

export const videoApi = createApi({
  reducerPath: "VideoApi",
  baseQuery: backendBaseQuery,
  tagTypes: ["Videos"],
  refetchOnMountOrArgChange: false,
  keepUnusedDataFor: 60,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    uploadVideo: builder.mutation<UploadVideoResType, UploadVideoBodyType>({
      async queryFn({ file, datasetId, uploadedBy, projectName, onProgress }) {
        const formData = new FormData();

        formData.append("file", file);

        if (datasetId) {
          formData.append("datasetId", datasetId);
        }

        if (uploadedBy) {
          formData.append("uploadedBy", uploadedBy);
        }
        if (projectName) {
          formData.append("projectName", projectName);
        }

        try {
          const response = await axios.post<UploadVideoResType>(
            `${API_URL}/videos/upload`,
            formData,
            {
              headers: {
                ...getAuthHeaders(),
              },
              onUploadProgress: (event) => {
                if (!event.total) return;

                const progress = Math.round((event.loaded * 100) / event.total);
                onProgress?.(progress);
              },
            },
          );

          onProgress?.(100);

          return {
            data: response.data,
          };
        } catch (error) {
          return {
            error: toRtkQueryError(error),
          };
        }
      },
      invalidatesTags: ["Videos"],
    }),

    getVideos: builder.query<VideoItemType[], string | void>({
      query: (datasetId) => ({
        url: "/videos",
        method: HttpMethod.GET,
        params: datasetId ? { datasetId } : undefined,
      }),
      providesTags: ["Videos"],
    }),

    getVideoById: builder.query<VideoItemType, string>({
      query: (id) => ({
        url: `/videos/${id}`,
        method: HttpMethod.GET,
      }),
      providesTags: (_result, _error, id) => [{ type: "Videos", id }],
    }),

    getVideoMetadata: builder.query<VideoMetadataResType, string>({
      query: (id) => ({
        url: `/videos/${id}/metadata`,
        method: HttpMethod.GET,
      }),
    }),

    deleteVideo: builder.mutation<DeleteVideoResType, string>({
      query: (id) => ({
        url: `/videos/${id}`,
        method: HttpMethod.DELETE,
      }),
      invalidatesTags: ["Videos"],
    }),
    extractFrames: builder.mutation<
      ExtractFramesResponse,
      {
        id: string;
        body: {
          pipelineType: "raw" | "processed";
          sampleFps?: number;
          config?: {
            outputRawFolder?: string;
            outputProcessedFolder?: string;
            outputMaskFolder?: string;
          };
        };
      }
    >({
      query: ({ id, body }) => ({
        url: `/videos/${id}/extract-frames`,
        method: "POST",
        body,
      }),
    }),

    preprocessAndGenerateMasks: builder.mutation<
      PreprocessAndGenerateMasksResponse,
      {
        videoId: string;
        body?: PreprocessAndGenerateMasksBody;
      }
    >({
      query: ({ videoId, body }) => ({
        url: `/videos/${videoId}/preprocess-and-generate-masks`,
        method: "POST",
        body: body ?? {
          config: {
            blurThreshold: 100,
            noiseThreshold: 25,
            outputProcessedFolder: "processed_images",
            outputMaskFolder: "masks",
          },
        },
      }),
    }),

    getVideoAssets: builder.query<VideoAssetsResponse, string>({
      query: (videoId) => `/videos/${videoId}/assets`,
    }),
  }),
});

export const {
  useUploadVideoMutation,
  useGetVideosQuery,
  useGetVideoByIdQuery,
  useGetVideoMetadataQuery,
  useExtractFramesMutation,
  useDeleteVideoMutation,
  usePreprocessAndGenerateMasksMutation,
  useGetVideoAssetsQuery,
} = videoApi;
