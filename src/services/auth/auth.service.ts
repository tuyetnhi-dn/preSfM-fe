import { HttpMethod } from "@/constants/http.enum";
import { backendBaseQuery } from "@/redux/services/client";
import { RegisterResType, RegisterBodyType } from "@/types/dtos/register.dto";
import { SendOtpBodyType, SendOtpResType } from "@/types/dtos/sendOtp.dto";
import { LoginBodyType, LoginResType } from "@/types/dtos/login.dto";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  AuthMessageResponse,
  ChangePasswordRequest,
  CurrentUserDto,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "@/types/dtos/auth.dto";

export const authApi = createApi({
  baseQuery: backendBaseQuery,
  reducerPath: "AuthApi",
  refetchOnMountOrArgChange: false,
  keepUnusedDataFor: 60,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  tagTypes: ["AuthApi"],
  endpoints: (builder) => ({
    sendOtp: builder.mutation<SendOtpResType, SendOtpBodyType>({
      query: (body) => ({
        url: "/auth/send-otp",
        method: HttpMethod.POST,
        body,
      }),
    }),

    registerWithOtp: builder.mutation<RegisterResType, RegisterBodyType>({
      query: (body) => ({
        url: "/auth/register",
        method: HttpMethod.POST,
        body,
      }),
    }),

    login: builder.mutation<LoginResType, LoginBodyType>({
      query: (body) => ({
        url: "/auth/login",
        method: HttpMethod.POST,
        body,
      }),
    }),
    forgotPassword: builder.mutation<
      AuthMessageResponse,
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<AuthMessageResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    changePassword: builder.mutation<
      AuthMessageResponse,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query<CurrentUserDto, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["AuthApi"],
    }),

    updateProfile: builder.mutation<
      UpdateProfileResponse,
      UpdateProfileRequest
    >({
      query: (body) => ({
        url: "/auth/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AuthApi"],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useRegisterWithOtpMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
} = authApi;
