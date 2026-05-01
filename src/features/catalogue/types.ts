export interface TileSize {
  id: string;
  label: string;
  active: boolean;
  createdAt: number;
}

export interface Size {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  updatedByPlatform?: string;
  updatedByName?: string | null;
}

export interface CreateSizeRequest {
  name: string;
}

export interface UpdateSizeRequest {
  name: string;
}

export interface LegacyFinish {
  id: string;
  name: string;
  sizeIds: string[];
  active: boolean;
  createdAt: number;
}

export interface Finish {
  id: string;
  name: string;
  isActive: boolean;
  sizes: Size[];
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  updatedByPlatform?: string;
  updatedByName?: string | null;
}

export interface CreateFinishRequest {
  name: string;
  sizeIds: string[];
}

export interface UpdateFinishRequest {
  name: string;
  sizeIds: string[];
  deletedSizeIds: string[];
}

export interface FinishSizePair {
  finishId: string;
  sizeId: string;
}

export interface CreateSeriesRequest {
  name: string;
  sizeFinishIds: string[];
}

export interface UpdateSeriesRequest {
  name: string;
  sizeFinishIds: string[];
  deletedSizeFinishIds: string[];
}

export interface SizeFinish {
  id: string;
  size: Size;
  finish: Finish;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  updatedByPlatform?: string;
  updatedByName?: string | null;
}

export interface LegacySeries {
  id: string;
  code: string;
  finishSizePairs: FinishSizePair[];
  description?: string;
  active: boolean;
  createdAt: number;
}

export interface Series {
  id: string;
  name: string;
  isActive: boolean;
  sizeFinishes: SizeFinish[];
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  updatedByPlatform?: string;
  updatedByName?: string | null;
}

export interface LegacyDesignCode {
  id: string;
  code: string;
  seriesId: string;
  applicablePairs: FinishSizePair[];
  thumbnailUrl?: string;
  active: boolean;
  createdAt: number;
}

export type DesignStatus = "pending" | "approved" | "rejected";

export interface DesignStatusHistoryEntry {
  status: DesignStatus;
  date: string;
  reason?: string;
}

export interface Design {
  id: string;
  name: string;
  thumbnailUrl: string;
  series: Series;
  sizeFinishes: SizeFinish[];
  status: DesignStatus;
  statusHistory: DesignStatusHistoryEntry[];
  isActive: boolean;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdByName?: string | null;
  approvedBy?: string;
  approvedByName?: string | null;
  updatedBy?: string;
  updatedByName?: string | null;
}
