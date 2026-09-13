import { GITHUB_OAUTH_SUCCESS_MESSAGE } from '@/constants/githubOAuth';

/** 팝업을 닫고 부모 창에 로그인 완료를 알림 (리다이렉트는 부모에서 처리) */
export function finishGitHubLogin() {
  const payload = { type: GITHUB_OAUTH_SUCCESS_MESSAGE };

  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(payload, window.location.origin);
    window.close();
    return;
  }

  window.postMessage(payload, window.location.origin);
  window.close();
}
