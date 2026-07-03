import { readStoredUser, writeStoredUser } from '@/lib/userStorage';

/** 앱 시작 시 더미 토큰·사용자 정보를 시드합니다. */
export function initDummySession(): void {
  if (!localStorage.getItem('accessToken')) {
    localStorage.setItem('accessToken', 'dummy-access-token');
    localStorage.setItem('refreshToken', 'dummy-refresh-token');
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
