/** Http 인터셉터 등 라우터 컨텍스트 밖에서 홈(/) 이동이 필요할 때 발행 */
export const AUTH_REDIRECT_HOME_EVENT = 'dvely:auth-redirect-home';

export function dispatchAuthRedirectHome() {
  window.dispatchEvent(new Event(AUTH_REDIRECT_HOME_EVENT));
}

/** GitHub App이 설치되지 않은 채로 로그인했을 때 발행 */
export const GITHUB_APP_INSTALL_REQUIRED_EVENT = 'dvely:github-app-install-required';

export function dispatchGitHubAppInstallRequired() {
  window.dispatchEvent(new Event(GITHUB_APP_INSTALL_REQUIRED_EVENT));
}

/**
 * 설치는 돼 있는데 User Token 이 끊겨 재인증이 필요할 때 발행.
 * 설치 요구와 다르다 — 권한은 그대로고 토큰만 다시 받으면 된다.
 */
export const GITHUB_APP_REAUTHORIZATION_REQUIRED_EVENT = 'dvely:github-app-reauthorization-required';

export function dispatchGitHubAppReauthorizationRequired() {
  window.dispatchEvent(new Event(GITHUB_APP_REAUTHORIZATION_REQUIRED_EVENT));
}
