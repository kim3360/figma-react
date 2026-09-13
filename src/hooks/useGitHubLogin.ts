import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { persistAuthTokens } from '@/lib/persistAuthTokens';
import { writeStoredUser } from '@/lib/userStorage';
import { GITHUB_OAUTH_SUCCESS_MESSAGE } from '@/constants/githubOAuth';

export function useGitHubLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const startGitHubLogin = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      persistAuthTokens({
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        githubAppInstalled: true,
      });
      writeStoredUser({
        id: 1,
        username: 'demo-user',
        avatarUrl: '',
        githubAppInstalled: true,
        githubAppTokenLinked: true,
        githubAppTokenExpired: false,
        githubAppReauthorizationRequired: false,
        githubAppAccessTokenExpiresAt: '2026-12-31T00:00:00.000Z',
        githubAppRefreshTokenExpiresAt: '2027-12-31T00:00:00.000Z',
      });
      window.postMessage({ type: GITHUB_OAUTH_SUCCESS_MESSAGE }, window.location.origin);
      await navigate({ to: '/home' });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '로그인을 시작하지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return { startGitHubLogin, isLoading, errorMessage };
}
