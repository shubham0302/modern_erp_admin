import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiPaginated, ApiSuccess } from "@/lib/api/types";
import type {
  CreateFinishRequest,
  CreateSeriesRequest,
  CreateSizeRequest,
  Design,
  Finish,
  Series,
  Size,
  SizeFinish,
  UpdateFinishRequest,
  UpdateSeriesRequest,
  UpdateSizeRequest,
} from "./types";

export const listSizes = async (): Promise<{ data: Size[]; total: number }> => {
  const response = await apiClient.get<ApiPaginated<Size>>(
    ENDPOINTS.INVENTORY_SIZES,
  );
  return { data: response.data.data, total: response.data.meta.total };
};

export const createSize = async (
  payload: CreateSizeRequest,
): Promise<Size> => {
  const response = await apiClient.post<ApiSuccess<Size>>(
    ENDPOINTS.INVENTORY_CREATE_SIZE,
    payload,
  );
  return response.data.data;
};

export const updateSize = async (
  id: string,
  payload: UpdateSizeRequest,
): Promise<Size> => {
  const response = await apiClient.patch<ApiSuccess<Size>>(
    `/inventory/sizes/update/${id}`,
    payload,
  );
  return response.data.data;
};

export const deleteSize = async (id: string): Promise<void> => {
  await apiClient.delete(`/inventory/sizes/delete/${id}`);
};

export const restoreSize = async (id: string): Promise<void> => {
  await apiClient.post(`/inventory/sizes/restore/${id}`);
};

export const listActiveSizes = async (): Promise<Size[]> => {
  const response = await apiClient.get<{ success: true; data: Size[] }>(
    ENDPOINTS.INVENTORY_SIZES,
    { params: { all: true, activeOnly: true } },
  );
  return response.data.data;
};

export const listFinishes = async (): Promise<{
  data: Finish[];
  total: number;
}> => {
  const response = await apiClient.get<ApiPaginated<Finish>>(
    ENDPOINTS.INVENTORY_FINISHES,
  );
  return { data: response.data.data, total: response.data.meta.total };
};

export const createFinish = async (
  payload: CreateFinishRequest,
): Promise<Finish> => {
  const response = await apiClient.post<ApiSuccess<Finish>>(
    ENDPOINTS.INVENTORY_CREATE_FINISH,
    payload,
  );
  return response.data.data;
};

export const updateFinish = async (
  id: string,
  payload: UpdateFinishRequest,
): Promise<Finish> => {
  const response = await apiClient.patch<ApiSuccess<Finish>>(
    `/inventory/finishes/update/${id}`,
    payload,
  );
  return response.data.data;
};

export const deleteFinish = async (id: string): Promise<void> => {
  await apiClient.delete(`/inventory/finishes/delete/${id}`);
};

export const restoreFinish = async (id: string): Promise<void> => {
  await apiClient.post(`/inventory/finishes/restore/${id}`);
};

export const listSizeFinishes = async (
  activeOnly = true,
): Promise<SizeFinish[]> => {
  const response = await apiClient.get<{ success: true; data: SizeFinish[] }>(
    ENDPOINTS.INVENTORY_SIZE_FINISHES,
    { params: { activeOnly } },
  );
  return response.data.data;
};

export const listSeries = async (): Promise<{
  data: Series[];
  total: number;
}> => {
  const response = await apiClient.get<ApiPaginated<Series>>(
    ENDPOINTS.INVENTORY_SERIES,
  );
  return { data: response.data.data, total: response.data.meta.total };
};

export const createSeries = async (
  payload: CreateSeriesRequest,
): Promise<Series> => {
  const response = await apiClient.post<ApiSuccess<Series>>(
    ENDPOINTS.INVENTORY_CREATE_SERIES,
    payload,
  );
  return response.data.data;
};

export const updateSeries = async (
  id: string,
  payload: UpdateSeriesRequest,
): Promise<Series> => {
  const response = await apiClient.patch<ApiSuccess<Series>>(
    `/inventory/series/update/${id}`,
    payload,
  );
  return response.data.data;
};

export const deleteSeries = async (id: string): Promise<void> => {
  await apiClient.delete(`/inventory/series/delete/${id}`);
};

export const restoreSeries = async (id: string): Promise<void> => {
  await apiClient.post(`/inventory/series/restore/${id}`);
};

export const listDesigns = async (): Promise<{
  data: Design[];
  total: number;
}> => {
  const response = await apiClient.get<ApiPaginated<Design>>(
    ENDPOINTS.INVENTORY_DESIGNS,
  );
  return { data: response.data.data, total: response.data.meta.total };
};

export const approveDesign = async (id: string): Promise<void> => {
  await apiClient.post(`/inventory/designs/approve/${id}`);
};

export const rejectDesign = async (
  id: string,
  reason: string,
): Promise<void> => {
  await apiClient.post(`/inventory/designs/reject/${id}`, { reason });
};
