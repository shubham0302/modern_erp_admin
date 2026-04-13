export interface TileSize {
  id: string;
  label: string;
  active: boolean;
  createdAt: number;
}

export interface Finish {
  id: string;
  name: string;
  sizeIds: string[];
  active: boolean;
  createdAt: number;
}

export interface FinishSizePair {
  finishId: string;
  sizeId: string;
}

export interface Series {
  id: string;
  code: string;
  finishSizePairs: FinishSizePair[];
  description?: string;
  active: boolean;
  createdAt: number;
}

export interface DesignCode {
  id: string;
  code: string;
  seriesId: string;
  applicablePairs: FinishSizePair[];
  thumbnailUrl?: string;
  active: boolean;
  createdAt: number;
}
