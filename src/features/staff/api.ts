import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiPaginated, ApiSuccess } from "@/lib/api/types";
import type {
  CreateRoleRequest,
  CreateStaffRequest,
  Role,
  RoleDetail,
  Staff,
  UpdateRoleRequest,
  UpdateStaffRequest,
} from "./types";

export const listStaff = async (): Promise<{ data: Staff[]; total: number }> => {
  const response = await apiClient.get<ApiPaginated<Staff>>(
    ENDPOINTS.ADMIN_STAFF,
  );
  return { data: response.data.data, total: response.data.meta.total };
};

export const createStaff = async (
  payload: CreateStaffRequest,
): Promise<Staff> => {
  const response = await apiClient.post<ApiSuccess<Staff>>(
    ENDPOINTS.ADMIN_CREATE_STAFF,
    payload,
  );
  return response.data.data;
};

export const getStaff = async (id: string): Promise<Staff> => {
  const response = await apiClient.get<ApiSuccess<Staff>>(
    `/admin/staff/${id}`,
  );
  return response.data.data;
};

export const updateStaff = async (
  id: string,
  payload: UpdateStaffRequest,
): Promise<Staff> => {
  const response = await apiClient.patch<ApiSuccess<Staff>>(
    `/admin/update/staff/${id}`,
    payload,
  );
  return response.data.data;
};

export const listRoles = async (): Promise<{ data: Role[]; total: number }> => {
  const response = await apiClient.get<ApiPaginated<Role>>(
    ENDPOINTS.ADMIN_ROLES,
  );
  return { data: response.data.data, total: response.data.meta.total };
};

export const createRole = async (
  payload: CreateRoleRequest,
): Promise<Role> => {
  const response = await apiClient.post<ApiSuccess<Role>>(
    ENDPOINTS.ADMIN_CREATE_ROLE,
    payload,
  );
  return response.data.data;
};

export const getRole = async (id: string): Promise<RoleDetail> => {
  const response = await apiClient.get<ApiSuccess<RoleDetail>>(
    `/admin/role/${id}`,
  );
  return response.data.data;
};

export const updateRole = async (
  id: string,
  payload: UpdateRoleRequest,
): Promise<Role> => {
  const response = await apiClient.patch<ApiSuccess<Role>>(
    `/admin/update/role/${id}`,
    payload,
  );
  return response.data.data;
};
