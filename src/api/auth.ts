import type { GitHubAuthUrlResult } from "@/types/auth.type"
import type { ApiResponse } from "@/types/response.type"
import { persistAuthTokens } from "@/lib/persistAuthTokens"
import { dummyCompleteGitHubCallback, dummyGetGitHubAppInstallUrl, dummyGetGitHubAuthUrl, dummyLogout } from "@/mocks/fixtures/dummyData"

/** 더미 GitHub 로그인 — 토큰만 localStorage에 저장 */
export async function loginWithDummyAuth() {
  const response = dummyCompleteGitHubCallback()
  persistAuthTokens(response)
  return response
}

/** GitHub 로그인 URL 발급 (더미) */
export async function fetchGitHubAuthUrl(): Promise<ApiResponse<GitHubAuthUrlResult>> {
  return dummyGetGitHubAuthUrl()
}

/** OAuth code 교환 (더미) */
export async function completeGitHubCallback(_params: { code: string; state: string }) {
  return dummyCompleteGitHubCallback()
}

/** GitHub App 설치 URL 발급 (더미) */
export async function fetchGitHubAppInstallUrl() {
  return dummyGetGitHubAppInstallUrl()
}

/** 로그아웃 (더미) */
export async function logout() {
  return dummyLogout()
}
