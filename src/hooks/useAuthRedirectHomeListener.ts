import { useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AUTH_REDIRECT_HOME_EVENT } from '@/constants/authEvents';

/** 토큰 만료 등으로 홈(/) 리다이렉트 이벤트 수신 */
export function useAuthRedirectHomeListener() {
  const navigate = useNavigate();

  const handleRedirectHome = useCallback(() => {
    void navigate({ to: '/', replace: true });
  }, [navigate]);

  useEffect(() => {
    window.addEventListener(AUTH_REDIRECT_HOME_EVENT, handleRedirectHome);
    return () => window.removeEventListener(AUTH_REDIRECT_HOME_EVENT, handleRedirectHome);
  }, [handleRedirectHome]);
}
