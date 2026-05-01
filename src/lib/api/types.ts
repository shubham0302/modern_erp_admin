export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type PageMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiPaginated<T> = {
  success: true;
  data: T[];
  meta: PageMeta;
};

export type ApiError = {
  success: false;
  error: {
    statusCode: number;
    errorCode: string;
    message: string;
    requestId: string;
    path: string;
  };
};

export const ERROR_CODES = {
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
} as const;
