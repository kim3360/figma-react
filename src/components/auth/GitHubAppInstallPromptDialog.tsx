import { useCallback, useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { GitBranch } from 'lucide-react';
import { fetchAndPersistUserInfo } from '@/api/user';
import { fetchGitHubAppInstallUrl } from '@/api/auth';
import { GITHUB_APP_INSTALL_REQUIRED_EVENT } from '@/constants/authEvents';
import {
  GITHUB_APP_INSTALL_POPUP_NAME,
  GITHUB_APP_INSTALL_SUCCESS_MESSAGE,
  GITHUB_OAUTH_POPUP_FEATURES,
} from '@/constants/githubOAuth';

function GitHubAppInstallPromptDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 앱 마운트 시 체크 — 이미 로그인된 상태(새로고침 등)에서도 감지
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return;

    void fetchAndPersistUserInfo().then((response) => {
      if (response.data && !response.data.githubAppInstalled) {
        setOpen(true);
      }
    });
  }, []);

  // OAuth 로그인 직후 이벤트 수신
  useEffect(() => {
    const handleRequired = () => setOpen(true);
    window.addEventListener(GITHUB_APP_INSTALL_REQUIRED_EVENT, handleRequired);
    return () => window.removeEventListener(GITHUB_APP_INSTALL_REQUIRED_EVENT, handleRequired);
  }, []);

  const handleInstallSuccess = useCallback((event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== GITHUB_APP_INSTALL_SUCCESS_MESSAGE) return;
    setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleInstallSuccess);
    return () => window.removeEventListener('message', handleInstallSuccess);
  }, [handleInstallSuccess]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const result = await fetchGitHubAppInstallUrl();
      if (!result?.data?.url) return;

      window.open(result.data.url, GITHUB_APP_INSTALL_POPUP_NAME, GITHUB_OAUTH_POPUP_FEATURES);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || pathname === '/') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/30 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
      >
        <div className="border-b border-[#f1f5f9] bg-[#fafafa] px-6 pb-5 pt-8 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-[#e5e7eb]">
            <GitBranch className="size-5 text-[#0f172a]" strokeWidth={1.75} aria-hidden />
          </span>
          <h2 className="mt-4 text-[20px] font-semibold tracking-tight text-[#0f172a]">
            GitHub 접근 권한 설정 필요
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#64748b]">
            저장소를 불러오려면 GitHub에 대한 접근 권한 허용이 필요합니다.
            <br />
            아래 버튼을 눌러 권한을 설정해 주세요.
          </p>
        </div>

        <div className="px-6 py-5">
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f172a] py-3 text-[14px] font-semibold text-white transition hover:bg-[#1e293b] disabled:opacity-50"
          >
            <GitBranch className="size-4" strokeWidth={1.75} aria-hidden />
            {isLoading ? '로딩 중...' : '권한 허용하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GitHubAppInstallPromptDialog;
