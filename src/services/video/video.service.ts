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
  UploadVideoReqType,
  UploadVideoResType,
  VideoAssetsResponse,
  VideoItemType,
  VideoMetadataResType,
} from "@/types/dtos/video/video.dto";
import { backendBaseQuery } from "@/redux/services/client";
import {
  RunOpenSfMComparisonBody,
  RunOpenSfMComparisonResponse,
} from "@/types/dtos/video/opensfm.dto";
import {
  PipelineRunStatusResponse,
  RunFullPipelineResponse,
} from "@/types/dtos/video/run-full-pipeline.type";

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
    uploadVideo: builder.mutation<UploadVideoResType, UploadVideoReqType>({
      queryFn: async (
        {
          file,
          uploadedBy,
          projectName,
          description,
          visibility,
          datasetName,
          onProgress,
        },
        _api,
        _extraOptions,
        baseQuery,
      ) => {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("uploadedBy", uploadedBy);
        formData.append("projectName", projectName);

        if (description) {
          formData.append("description", description);
        }

        formData.append("visibility", visibility ?? "private");
        formData.append("datasetName", datasetName || projectName);

        const xhr = new XMLHttpRequest();

        const result = await new Promise<{
          data?: UploadVideoResType;
          error?: { status: number; data: unknown };
        }>((resolve) => {
          xhr.open(
            "POST",
            `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/videos/upload`,
          );

          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;

            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress?.(percent);
          };

          xhr.onload = () => {
            try {
              const data = JSON.parse(xhr.responseText);

              if (xhr.status >= 200 && xhr.status < 300) {
                resolve({ data });
              } else {
                resolve({
                  error: {
                    status: xhr.status,
                    data,
                  },
                });
              }
            } catch {
              resolve({
                error: {
                  status: xhr.status,
                  data: xhr.responseText,
                },
              });
            }
          };

          xhr.onerror = () => {
            resolve({
              error: {
                status: xhr.status || 500,
                data: "Upload failed",
              },
            });
          };

          xhr.send(formData);
        });

        if (result.error) {
          return {
            error: {
              status: result.error.status,
              data: result.error.data,
            },
          };
        }

        return { data: result.data! };
      },
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

    runFullPipeline: builder.mutation<
      {
        message: string;
        videoId: string;
        pipelineRunId: string;
      },
      {
        videoId: string;
        body: {
          sampleFps: number;
          blurThreshold: number;
          noiseThreshold: number;
          runDense: boolean;
          mode?: "fast" | "balanced" | "quality";
        };
      }
    >({
      query: ({ videoId, body }) => ({
        url: `/videos/${videoId}/run-full-pipeline`,
        method: "POST",
        body,
      }),
    }),

    getPipelineRunStatus: builder.query<any, string>({
      query: (pipelineRunId) => ({
        url: `/videos/pipeline-runs/${pipelineRunId}/status`,
        method: "GET",
      }),
    }),

    runOpenSfMComparison: builder.mutation<
      RunOpenSfMComparisonResponse,
      {
        videoId: string;
        body?: RunOpenSfMComparisonBody;
      }
    >({
      query: ({ videoId, body }) => ({
        url: `/videos/${videoId}/run-opensfm-comparison`,
        method: "POST",
        body: body ?? {
          runDense: true,
        },
      }),
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
  useRunOpenSfMComparisonMutation,
  useRunFullPipelineMutation,
  useGetPipelineRunStatusQuery,
} = videoApi;
