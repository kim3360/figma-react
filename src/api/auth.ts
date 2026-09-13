import Http from '@/utils/httpClients';
import { errorResponse, succesResponse } from '@/utils/response';
import {
  getGitHubAuthUrlResSchema,
  getGitHubCallbackResSchema,
  postAuthRefreshReqSchema,
  postAuthRefreshResSchema,
  type GetGitHubAuthUrlResType,
  type GetGitHubCallbackResType,
  type PostAuthRefreshReqType,
  type PostAuthRefreshResType,
} from '@/types/auth.type';
import type { ApiResponse } from '@/types/response.type';

const endpoint = '/auth/github';

/** 1) GET /auth/github/url — GitHub 로그인 URL 발급 */
export async function fetchGitHubAuthUrl() {
  return Http.instance
    .get<GetGitHubAuthUrlResType>(`${endpoint}/url`)
    .then((response) => {
      const data = succesResponse<GetGitHubAuthUrlResType>(response);
      return getGitHubAuthUrlResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 2) GET /auth/github/callback?code=&state= — OAuth code 교환 */
export async function completeGitHubCallback(params: { code: string; state: string }) {
  return Http.instance
    .get<GetGitHubCallbackResType>(`${endpoint}/callback`, { params })
    .then((response) => {
      const data = succesResponse<GetGitHubCallbackResType>(response);
      return getGitHubCallbackResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** GET /auth/github/app/install-url — GitHub App 설치 URL 발급 */
export async function fetchGitHubAppInstallUrl() {
  return Http.instance
    .get<GetGitHubAuthUrlResType>(`${endpoint}/app/install-url`)
    .then((response) => {
      const data = succesResponse<GetGitHubAuthUrlResType>(response);
      return getGitHubAuthUrlResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** GET /auth/github/app/reauthorize-url — GitHub App User Token 재인증 URL 조회 */
export async function fetchGitHubAppReauthorizeUrl() {
  return Http.instance
    .get<GetGitHubAuthUrlResType>(`${endpoint}/app/reauthorize-url`)
    .then((response) => {
      const data = succesResponse<GetGitHubAuthUrlResType>(response);
      return getGitHubAuthUrlResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** GET /auth/github/app/callback — GitHub App 설치 완료 콜백 */
export async function completeGitHubAppCallback(params: {
  installation_id?: string;
  setup_action?: string;
  state?: string;
}) {
  return Http.instance
    .get(`${endpoint}/app/callback`, { params })
    .then(succesResponse)
    .catch(errorResponse());
}

/** POST /auth/refresh — Access Token 재발급 */
export async function postAuthRefresh(params: PostAuthRefreshReqType) {
  const payload = postAuthRefreshReqSchema.parse(params);

  return Http.instance
    .post<PostAuthRefreshResType>('/auth/refresh', payload)
    .then((response) => {
      const data = succesResponse<PostAuthRefreshResType>(response);
      return postAuthRefreshResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** DELETE /auth/logout — 로그아웃 */
export async function logout() {
  return Http.instance
    .delete<ApiResponse<void>>('/auth/logout')
    .then((response) => {
      return succesResponse<ApiResponse<void>>(response);
    })
    .catch(errorResponse());
}
