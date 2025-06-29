export interface ApiResponse<T> {
  status: 'ok' | 'error';
  message: string;
  data?: T;
}