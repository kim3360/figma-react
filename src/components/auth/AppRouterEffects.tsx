import { useAuthRedirectHomeListener } from '@/hooks/useAuthRedirectHomeListener';
import { useGitHubOAuthSuccessListener } from '@/hooks/useGitHubOAuthSuccessListener';
import { persistAuthTokens } from '@/lib/persistAuthTokens';
import { readStoredUser, writeStoredUser } from '@/lib/userStorage';

function ensureDummySession() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('accessToken')) {
    persistAuthTokens({
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token',
      githubAppInstalled: true,
    });
  }
  if (!readStoredUser()) {
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
  }
}

/** RouterProvider 내부 전역 네비게이션 사이드 이펙트 (렌더 없음) */
function AppRouterEffects() {
  ensureDummySession();
  useGitHubOAuthSuccessListener();
  useAuthRedirectHomeListener();
  return null;
}

export default AppRouterEffects;
