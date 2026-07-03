import { useCallback, useState } from 'react';
import { loginWithDummyAuth } from '@/api/auth';
import { fetchAndPersistUserInfo } from '@/api/user';
import { GITHUB_OAUTH_SUCCESS_MESSAGE } from '@/constants/githubOAuth';

export function useGitHubLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startGitHubLogin = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await loginWithDummyAuth();
      await fetchAndPersistUserInfo();
      window.postMessage({ type: GITHUB_OAUTH_SUCCESS_MESSAGE }, window.location.origin);
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
