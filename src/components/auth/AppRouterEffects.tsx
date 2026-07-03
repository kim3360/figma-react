import { useAuthRedirectHomeListener } from '@/hooks/useAuthRedirectHomeListener';
import { useGitHubOAuthSuccessListener } from '@/hooks/useGitHubOAuthSuccessListener';

/** RouterProvider 내부 전역 네비게이션 사이드 이펙트 (렌더 없음) */
function AppRouterEffects() {
  useGitHubOAuthSuccessListener();
  useAuthRedirectHomeListener();
  return null;
}

export default AppRouterEffects;
