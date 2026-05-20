import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const backendBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");

    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return headers;
  },
});
