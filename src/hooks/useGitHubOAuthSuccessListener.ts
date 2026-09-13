import { useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { dispatchGitHubAppInstallRequired } from '@/constants/authEvents';
import { GITHUB_OAUTH_SUCCESS_MESSAGE } from '@/constants/githubOAuth';
import { handleGitHubOAuthSuccess } from '@/lib/handleGitHubOAuthSuccess';
import { readStoredUser } from '@/api/user';

/** GitHub OAuth 팝업 완료 시 부모 창에서 user/me 조회 후 홈으로 이동 */
export function useGitHubOAuthSuccessListener() {
  const navigate = useNavigate();

  const handleOAuthSuccess = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== GITHUB_OAUTH_SUCCESS_MESSAGE) return;

      void (async () => {
        try {
          await handleGitHubOAuthSuccess();
        } finally {
          void navigate({ to: '/home', replace: true });

          const user = readStoredUser();
          if (user && !user.githubAppInstalled) {
            dispatchGitHubAppInstallRequired();
          }
        }
      })();
    },
    [navigate],
  );

  useEffect(() => {
    let isHandlingOAuthSuccess = false;

    const onMessage = (event: MessageEvent) => {
      if (isHandlingOAuthSuccess) return;
      if (event.data?.type !== GITHUB_OAUTH_SUCCESS_MESSAGE) return;

      isHandlingOAuthSuccess = true;
      handleOAuthSuccess(event);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleOAuthSuccess]);
}
