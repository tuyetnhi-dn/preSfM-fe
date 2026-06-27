import { HttpMethod } from "@/constants/http.enum";
import { backendBaseQuery } from "@/redux/services/client";
import {
  AdminProjectDetailDto,
  AdminProjectListItemDto,
  AdminStatsDto,
  AdminUserDetailDto,
  AdminUserListItemDto,
  GetAdminProjectsParams,
  GetAdminUserDetailParams,
  GetAdminUsersParams,
  PaginatedResponse,
  UpdateAdminUserStatusRequest,
  UpdateAdminUserStatusResponse,
} from "@/types/dtos/admin.dto";
import { createApi } from "@reduxjs/toolkit/query/react";

function buildAdminUsersUrl(params: GetAdminUsersParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 12));

  if (params.email?.trim()) {
    searchParams.set("email", params.email.trim());
  }

  if (params.role && params.role !== "all") {
    searchParams.set("role", params.role);
  }

  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  searchParams.set("_ts", String(Date.now()));

  return `/admin/users?${searchParams.toString()}`;
}
function buildAdminUserDetailUrl(params: GetAdminUserDetailParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 12));
  searchParams.set("_ts", String(Date.now()));

  return `/admin/users/${params.userId}?${searchParams.toString()}`;
}
function buildAdminProjectsUrl(params: GetAdminProjectsParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 12));

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.visibility && params.visibility !== "all") {
    searchParams.set("visibility", params.visibility);
  }

  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  searchParams.set("_ts", String(Date.now()));

  return `/admin/projects?${searchParams.toString()}`;
}

export const adminApi = createApi({
  baseQuery: backendBaseQuery,
  reducerPath: "AdminApi",
  refetchOnMountOrArgChange: false,
  keepUnusedDataFor: 60,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  tagTypes: ["AdminApi"],
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStatsDto, void>({
      query: () => ({
        url: "/admin/stats",
        method: HttpMethod.GET,
      }),
      providesTags: ["AdminApi"],
    }),

    getAdminUsers: builder.query<
      PaginatedResponse<AdminUserListItemDto>,
      GetAdminUsersParams
    >({
      query: (params) => ({
        url: buildAdminUsersUrl(params),
        method: HttpMethod.GET,
        headers: {
          "Cache-Control": "no-cache",
        },
      }),
      providesTags: ["AdminApi"],
    }),

    updateAdminUserStatus: builder.mutation<
      UpdateAdminUserStatusResponse,
      UpdateAdminUserStatusRequest
    >({
      query: ({ userId, status }) => ({
        url: `/admin/users/${userId}/status`,
        method: HttpMethod.PATCH,
        body: {
          status,
        },
      }),
      invalidatesTags: ["AdminApi"],
    }),
    getAdminUserDetail: builder.query<
      AdminUserDetailDto,
      GetAdminUserDetailParams
    >({
      query: (params) => ({
        url: buildAdminUserDetailUrl(params),
        method: HttpMethod.GET,
      }),
      providesTags: ["AdminApi"],
    }),

    getAdminProjectDetail: builder.query<AdminProjectDetailDto, string>({
      query: (projectId) => ({
        url: `/admin/projects/${projectId}`,
        method: HttpMethod.GET,
      }),
      providesTags: ["AdminApi"],
    }),
    getAdminProjects: builder.query<
      PaginatedResponse<AdminProjectListItemDto>,
      GetAdminProjectsParams
    >({
      query: (params) => ({
        url: buildAdminProjectsUrl(params),
        method: HttpMethod.GET,
      }),
      providesTags: ["AdminApi"],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
  useGetAdminUserDetailQuery,
  useGetAdminProjectDetailQuery,
  useGetAdminProjectsQuery,
} = adminApi;
