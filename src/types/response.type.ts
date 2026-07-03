export type ApiResponse<T> = {
  status: number;
  code: string;
  message: string;
  data?: T;
};
