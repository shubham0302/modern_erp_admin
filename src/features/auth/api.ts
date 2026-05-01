import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiSuccess } from "@/lib/api/types";
import type {
  Admin,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
} from "./types";

export const login = async (
  payload: LoginRequest,
): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiSuccess<LoginResponse>>(
    ENDPOINTS.ADMIN_LOGIN,
    payload,
  );
  return response.data.data;
};

export const fetchProfile = async (): Promise<Admin> => {
  const response = await apiClient.get<ApiSuccess<ProfileResponse>>(
    ENDPOINTS.ADMIN_PROFILE,
  );
  const { kind: _kind, ...admin } = response.data.data;
  return admin;
};

export const logout = async (): Promise<void> => {
  await apiClient.post(ENDPOINTS.ADMIN_LOGOUT);
};
