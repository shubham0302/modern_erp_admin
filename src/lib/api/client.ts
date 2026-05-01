import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/features/auth/storage";
import { useAuthStore } from "@/features/auth/store";
import type { ApiError, ApiSuccess } from "./types";
import { ERROR_CODES } from "./types";
import { ENDPOINTS } from "./endpoints";
import type { RefreshResponse } from "@/features/auth/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (!config.headers.has("Authorization")) {
    const token = getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const drainQueue = (token: string | null, err: unknown = null) => {
  const queue = pendingQueue;
  pendingQueue = [];
  for (const item of queue) {
    if (token) item.resolve(token);
    else item.reject(err);
  }
};

let isLoggingOut = false;

const forceLogout = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  clearTokens();
  useAuthStore.getState().clear();
  toast.error("Session expired, please login again");
  window.location.assign("/login");
};

const requestNewTokens = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await axios.post<ApiSuccess<RefreshResponse>>(
    `${BASE_URL}${ENDPOINTS.ADMIN_REFRESH}`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } },
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  setTokens({ accessToken, refreshToken: newRefreshToken });
  return accessToken;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalConfig = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const errorCode = error.response?.data?.error?.errorCode;
    const url = originalConfig?.url ?? "";

    if (status !== 401 || !originalConfig) {
      return Promise.reject(error);
    }

    if (originalConfig._retried) {
      forceLogout();
      return Promise.reject(error);
    }

    if (
      url.includes(ENDPOINTS.ADMIN_LOGIN) ||
      url.includes(ENDPOINTS.ADMIN_REFRESH)
    ) {
      return Promise.reject(error);
    }

    if (errorCode !== ERROR_CODES.TOKEN_EXPIRED) {
      forceLogout();
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = requestNewTokens()
        .then((token) => {
          drainQueue(token);
          return token;
        })
        .catch((err) => {
          drainQueue(null, err);
          forceLogout();
          throw err;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    }).then((newToken) => {
      const retryConfig: RetriableConfig = {
        ...originalConfig,
        _retried: true,
      };
      retryConfig.headers.set("Authorization", `Bearer ${newToken}`);
      return apiClient(retryConfig as AxiosRequestConfig);
    });
  },
);
