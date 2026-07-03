import type { AxiosResponse } from 'axios';

export function succesResponse<T>(res: AxiosResponse<T>) {
  return res.data;
}

export function errorResponse() {
  return (err: any) => {
    if (err.response && err.response.data) {
      const message = err.response.data;

      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
    //  response가 없는 경우 (네트워크/CORS 등)
    throw new Error(err.message || 'Unknown network error');
  };
}
