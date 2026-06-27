import { adminApi } from "@/services/admin/admin.service";
import { authApi } from "@/services/auth/auth.service";
import { projectApi } from "@/services/project/project.service";
import { videoApi } from "@/services/video/video.service";
import { configureStore } from "@reduxjs/toolkit";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [videoApi.reducerPath]: videoApi.reducer,
      [projectApi.reducerPath]: projectApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        videoApi.middleware,
        projectApi.middleware,
        adminApi.middleware,
      ),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
