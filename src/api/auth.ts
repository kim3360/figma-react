import Http from '@/utils/httpClients';
import { errorResponse, succesResponse } from '@/utils/response';
import type { GitHubAuthUrlResult, GitHubCallbackResult } from '@/types/auth.type';
import type { ApiResponse } from '@/types/response.type';

const endpoint = '/auth/github';

/** 1) GET /auth/github/url — GitHub 로그인 URL 발급 */
export async function fetchGitHubAuthUrl() {
  return Http.instance
    .get<ApiResponse<GitHubAuthUrlResult>>(`${endpoint}/url`)
    .then((response) => {
      return succesResponse<ApiResponse<GitHubAuthUrlResult>>(response);
    })
    .catch(errorResponse());
}

/** 2) GET /auth/github/callback?code=&state= — OAuth code 교환 */
export async function completeGitHubCallback(params: { code: string; state: string }) {
  return Http.instance
    .get<ApiResponse<GitHubCallbackResult>>(`${endpoint}/callback`, { params })
    .then((response) => {
      return succesResponse<ApiResponse<GitHubCallbackResult>>(response);
    })
    .catch(errorResponse());
}

/** GET /auth/github/app/install-url — GitHub App 설치 URL 발급 */
export async function fetchGitHubAppInstallUrl() {
  return Http.instance
    .get<ApiResponse<GitHubAuthUrlResult>>(`${endpoint}/app/install-url`)
    .then((response) => {
      return succesResponse<ApiResponse<GitHubAuthUrlResult>>(response);
    })
    .catch(errorResponse());
}

/** POST /auth/logout — 로그아웃 */
export async function logout() {
  return Http.instance
    .delete<ApiResponse<void>>('/auth/logout')
    .then((response) => {
      return succesResponse<ApiResponse<void>>(response);
    })
    .catch(errorResponse());
}
