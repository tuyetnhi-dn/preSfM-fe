import { HttpMethod } from "@/constants/http.enum";
import { backendBaseQuery } from "@/redux/services/client";
import { RegisterResType, RegisterBodyType } from "@/types/dtos/register.dto";
import { SendOtpBodyType, SendOtpResType } from "@/types/dtos/sendOtp.dto";
import { LoginBodyType, LoginResType } from "@/types/dtos/login.dto";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  baseQuery: backendBaseQuery,
  reducerPath: "AuthApi",
  refetchOnMountOrArgChange: false,
  keepUnusedDataFor: 60,
  refetchOnFocus: false,
  refetchOnReconnect: true,
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
  }),
});

export const {
  useSendOtpMutation,
  useRegisterWithOtpMutation,
  useLoginMutation,
} = authApi;
