import { readStoredUser, writeStoredUser } from '@/lib/userStorage';

/** API 없이 UI 탐색용 데모 모드. `VITE_DEMO_MODE=false`로 끌 수 있습니다. */
export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE !== 'false';
}

/** 앱 시작 시 데모 토큰·사용자 정보를 시드해 인증 라우트에 진입할 수 있게 합니다. */
export function initDemoSession(): void {
  if (!isDemoMode()) return;

  if (!localStorage.getItem('accessToken')) {
    localStorage.setItem('accessToken', 'demo-access-token');
    localStorage.setItem('refreshToken', 'demo-refresh-token');
  }

  if (!readStoredUser()) {
    writeStoredUser({
      id: 1,
      username: 'demo-user',
      avatarUrl: '',
      githubAppInstalled: true,
    });
  }
}
