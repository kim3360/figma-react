import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { resolveDummyHttp } from '@/mocks/fixtures/dummyHttp';

function toPath(url?: string) {
  if (!url) return '/';
  if (url.startsWith('http')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url.split('?')[0] || '/';
}

function toParams(config?: AxiosRequestConfig) {
  const params = config?.params;
  if (!params || typeof params !== 'object') return undefined;
  return params as Record<string, unknown>;
}

function toAxiosResponse<T>(result: { status: number; data: unknown }, config?: AxiosRequestConfig) {
  return {
    data: result.data as T,
    status: result.status,
    statusText: result.status === 204 ? 'No Content' : 'OK',
    headers: {},
    config: config ?? {},
  } as AxiosResponse<T>;
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  const result = resolveDummyHttp({
    method,
    path: toPath(url),
    body,
    params: toParams(config),
  });
  return toAxiosResponse<T>(result, config);
}

const instance = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return request<T>('GET', url, undefined, config);
  },
  post<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return request<T>('POST', url, body, config);
  },
  put<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return request<T>('PUT', url, body, config);
  },
  patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return request<T>('PATCH', url, body, config);
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return request<T>('DELETE', url, undefined, config);
  },
  request<T>(config: AxiosRequestConfig) {
    return request<T>(config.method ?? 'GET', config.url ?? '/', config.data, config);
  },
};

class Http {
  public readonly instance = instance;
}

export default new Http();
