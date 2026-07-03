import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { dispatchAuthRedirectHome } from '@/constants/authEvents';
import { clearAppLocalStorage } from '@/lib/clearAppStorage';

type TokenPair = {
  value: string;
  expiredAt: string;
};

type AccessByRefreshResponse = {
  result?: {
    accessToken?: TokenPair;
  };
};

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

class Http {
  public readonly instance: AxiosInstance;
  private readonly baseUrl = import.meta.env.VITE_API_URL;

  private isRefreshing = false;
  private refreshSubscribers: Array<(accessToken: string | null) => void> = [];

  // refresh 요청은 인터셉터 영향 없이 별도 client 사용
  private readonly refreshClient = axios.create({
    baseURL: this.baseUrl,
    withCredentials: true,
  });

  constructor() {
    this.instance = axios.create({
      baseURL: this.baseUrl,
      withCredentials: true,
    });

    this.attachInterceptors();
  }

  // =========================
  // storage helpers
  // =========================
  private getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  private setAccessToken(accessToken: TokenPair) {
    localStorage.setItem('accessToken', accessToken.value);
  }

  private clearTokens() {
    clearAppLocalStorage();
  }

  private goLogin(reason: string) {
    console.log('[AUTH_FLOW] goLogin:', reason);
    this.clearTokens();
    dispatchAuthRedirectHome();
  }

  // =========================
  // interceptors
  // =========================
  private attachInterceptors() {
    this.instance.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (!token) return config;

      const headers = new AxiosHeaders(config.headers);
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
      return config;
    });

    this.instance.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => this.handleAuthError(err),
    );
  }

  // =========================
  // queue helpers
  // =========================
  private subscribeTokenRefresh(cb: (accessToken: string | null) => void) {
    this.refreshSubscribers.push(cb);
  }

  private flushQueue(accessToken: string | null) {
    const subs = this.refreshSubscribers;
    this.refreshSubscribers = [];
    subs.forEach((cb) => cb(accessToken));
  }

  // =========================
  // endpoint guards
  // =========================
  private isAccessByRefreshRequest(config: RetriableRequestConfig) {
    return (config.url ?? '').includes('/user/access-by-refresh');
  }

  private withAuthHeader(config: RetriableRequestConfig, token: string) {
    const headers = new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return { ...config, headers };
  }

  // =========================
  // refresh flow (ONLY 1-step)
  // =========================
  /**
   * refreshToken으로 accessToken만 재발급
   * refreshToken이 만료/무효(401/403)면 재발급 시도하지 않고 즉시 로그인 이동 + 로컬스토리지 clear
   */
  private async accessByRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.goLogin('no refresh token');
      throw new Error('No refresh token available');
    }

    try {
      const res = await this.refreshClient.post<AccessByRefreshResponse>(
        '/user/access-by-refresh',
        { token: refreshToken },
      );

      const accessToken = res.data?.result?.accessToken;
      if (!accessToken?.value || !accessToken?.expiredAt) {
        throw new Error('access-by-refresh response missing accessToken');
      }

      this.setAccessToken(accessToken);
      return accessToken.value;
    } catch (e) {
      const err = e as AxiosError;
      const status = err?.response?.status;

      // refreshToken 만료/무효 => 재발급 X, 로그인 이동
      if (status === 401 || status === 403) {
        this.goLogin(`refresh token expired/invalid (status ${status})`);
      }

      throw e;
    }
  }

  // =========================
  // 401 handler
  // =========================
  private async handleAuthError(error: AxiosError) {
    const config = error.config as RetriableRequestConfig | undefined;

    if (!error.response || !config) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);

    // refresh endpoint 자체가 401이면 이미 accessByRefresh()에서 goLogin 처리됨
    if (this.isAccessByRefreshRequest(config)) {
      return Promise.reject(error);
    }

    // 무한 루프 방지
    if (config._retry) return Promise.reject(error);
    config._retry = true;

    // 이미 refresh 중이면 큐에 등록 후 토큰 받으면 재시도
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.subscribeTokenRefresh((accessToken) => {
          if (!accessToken) return reject(error);
          resolve(this.instance.request(this.withAuthHeader(config, accessToken)));
        });
      });
    }

    this.isRefreshing = true;

    try {
      const newAccessToken = await this.accessByRefresh();

      // 대기 요청들 처리
      this.flushQueue(newAccessToken);

      // 원 요청 재시도
      return this.instance.request(this.withAuthHeader(config, newAccessToken));
    } catch (e) {
      // refresh 자체 실패 → 큐 실패 처리
      this.flushQueue(null);
      return Promise.reject(e);
    } finally {
      this.isRefreshing = false;
    }
  }
}

export default new Http();
