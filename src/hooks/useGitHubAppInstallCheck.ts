import { useEffect } from 'react';
import { fetchAndPersistUserInfo } from '@/api/user';
import { dispatchGitHubAppInstallRequired } from '@/constants/authEvents';

/** 앱 마운트 시 GitHub App 설치 여부 확인 — 미설치 시 권한 요청 다이얼로그 트리거 */
export function useGitHubAppInstallCheck() {
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return;

    void fetchAndPersistUserInfo().then((response) => {
      if (response.data && !response.data.githubAppInstalled) {
        dispatchGitHubAppInstallRequired();
      }
    });
  }, []);
}
