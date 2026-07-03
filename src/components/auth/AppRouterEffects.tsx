import { useAuthRedirectHomeListener } from '@/hooks/useAuthRedirectHomeListener';

/** RouterProvider 내부 전역 네비게이션 사이드 이펙트 (렌더 없음) */
function AppRouterEffects() {
  useAuthRedirectHomeListener();
  return null;
}

export default AppRouterEffects;
