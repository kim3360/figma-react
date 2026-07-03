import { useCallback, useState } from 'react';
import { fetchGitHubAuthUrl } from '@/api/auth';
import { GITHUB_OAUTH_POPUP_FEATURES, GITHUB_OAUTH_POPUP_NAME } from '@/constants/githubOAuth';
import {
  clearOAuthCodeProcessed,
  extractStateFromOAuthUrl,
  saveOAuthState,
} from '@/services/auth/oauthState';

export function useGitHubLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startGitHubLogin = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data } = await fetchGitHubAuthUrl();
      const url = data?.url;

      if (!url) {
        throw new Error('GitHub 로그인 URL을 받지 못했습니다.');
      }

      clearOAuthCodeProcessed();

      const state = extractStateFromOAuthUrl(url);
      if (state) saveOAuthState(state);

      const popup = window.open(url, GITHUB_OAUTH_POPUP_NAME, GITHUB_OAUTH_POPUP_FEATURES);
      if (!popup) {
        throw new Error('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'GitHub 로그인을 시작하지 못했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { startGitHubLogin, isLoading, errorMessage };
}
