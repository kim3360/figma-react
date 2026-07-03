/** Http 인터셉터 등 라우터 컨텍스트 밖에서 홈(/) 이동이 필요할 때 발행 */
export const AUTH_REDIRECT_HOME_EVENT = 'dvely:auth-redirect-home';

export function dispatchAuthRedirectHome() {
  window.dispatchEvent(new Event(AUTH_REDIRECT_HOME_EVENT));
}
