import { useCallback, useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { GITHUB_OAUTH_SUCCESS_MESSAGE } from '@/constants/githubOAuth';

function readIsLoggedIn(): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
}

/** accessToken 존재 여부로 로그인 상태를 동기화 */
export function useIsLoggedIn(): [boolean, () => void] {
  const [isLoggedIn, setIsLoggedIn] = useState(readIsLoggedIn);

  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const sync = useCallback(() => {
    setIsLoggedIn(readIsLoggedIn());
  }, []);

  useEffect(() => {
    sync();
  }, [pathname, sync]);

  useEffect(() => {
    const onStorage = () => sync();

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== GITHUB_OAUTH_SUCCESS_MESSAGE) return;
      sync();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('message', onMessage);
    };
  }, [sync]);

  return [isLoggedIn, sync];
}
