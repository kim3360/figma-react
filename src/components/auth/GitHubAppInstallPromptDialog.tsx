import { useCallback, useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { GitBranch } from 'lucide-react';
import { refreshUserInfoInBackground } from '@/api/user';
import { fetchGitHubAppInstallUrl, fetchGitHubAppReauthorizeUrl } from '@/api/auth';
import {
  GITHUB_APP_INSTALL_REQUIRED_EVENT,
  GITHUB_APP_REAUTHORIZATION_REQUIRED_EVENT,
} from '@/constants/authEvents';
import {
  GITHUB_APP_INSTALL_POPUP_NAME,
  GITHUB_APP_INSTALL_SUCCESS_MESSAGE,
  GITHUB_OAUTH_POPUP_FEATURES,
} from '@/constants/githubOAuth';

/**
 * 두 모드는 사용자가 처한 상황이 다르다.
 * install은 아직 권한을 준 적이 없는 경우, reauthorize는 이미 준 권한의 인증이 만료된 경우다.
 * 같은 문구를 쓰면 이미 권한을 준 사용자가 "왜 또 권한을 달라고 하지?" 하고 당황한다.
 */
const PROMPT_COPY = {
  install: {
    title: 'GitHub 접근 권한 설정 필요',
    description: (
      <>
        저장소를 불러오려면 GitHub에 대한 접근 권한 허용이 필요합니다.
        <br />
        아래 버튼을 눌러 권한을 설정해 주세요.
      </>
    ),
    confirmLabel: '권한 허용하기',
  },
  reauthorize: {
    title: 'GitHub 연결이 만료되었습니다',
    description: (
      <>
        권한은 그대로 있지만 GitHub 인증이 만료되어 저장소에 접근할 수 없습니다.
        <br />
        아래 버튼을 눌러 다시 인증해 주세요.
      </>
    ),
    confirmLabel: '다시 인증하기',
  },
} as const;

function GitHubAppInstallPromptDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [promptMode, setPromptMode] = useState<'install' | 'reauthorize'>('install');

  // 앱 마운트 시 체크 — 이미 로그인된 상태(새로고침 등)에서도 감지
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return;

    void refreshUserInfoInBackground().then((response) => {
      if (!response?.data) return;
      if (!response.data.githubAppInstalled) {
        setPromptMode('install');
        setOpen(true);
        return;
      }
      // githubAppTokenExpired가 아니다 — 그 값은 액세스 토큰의 신선도만 나타내고,
      // 서버가 GitHub을 호출하는 경로마다 리프레시 토큰으로 자동 재발급한다.
      // 그걸로 판단하면 멀쩡히 권한 있는 사용자에게 8시간마다 모달이 떴다.
      if (response.data.githubAppReauthorizationRequired) {
        setPromptMode('reauthorize');
        setOpen(true);
      }
    });
  }, []);

  // OAuth 로그인 직후 이벤트 수신
  useEffect(() => {
    const handleRequired = () => {
      setPromptMode('install');
      setOpen(true);
    };
    window.addEventListener(GITHUB_APP_INSTALL_REQUIRED_EVENT, handleRequired);
    return () => window.removeEventListener(GITHUB_APP_INSTALL_REQUIRED_EVENT, handleRequired);
  }, []);

  // 마운트 시 한 번만 보면 세션 중간에 토큰이 끊긴 경우를 놓친다.
  // 사용자 정보를 다시 읽는 곳이면 어디든 이 이벤트로 진입점을 띄운다
  useEffect(() => {
    const handleReauthorize = () => {
      setPromptMode('reauthorize');
      setOpen(true);
    };
    window.addEventListener(GITHUB_APP_REAUTHORIZATION_REQUIRED_EVENT, handleReauthorize);
    return () =>
      window.removeEventListener(GITHUB_APP_REAUTHORIZATION_REQUIRED_EVENT, handleReauthorize);
  }, []);

  const handleInstallSuccess = useCallback((event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== GITHUB_APP_INSTALL_SUCCESS_MESSAGE) return;
    setOpen(false);
    // 저장된 사용자 정보에 옛 만료 플래그가 남지 않도록 다시 읽는다
    void refreshUserInfoInBackground();
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
      const result =
        promptMode === 'reauthorize'
          ? await fetchGitHubAppReauthorizeUrl()
          : await fetchGitHubAppInstallUrl();
      if (!result?.data?.url) return;

      window.open(result.data.url, GITHUB_APP_INSTALL_POPUP_NAME, GITHUB_OAUTH_POPUP_FEATURES);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || pathname === '/') return null;

  const copy = PROMPT_COPY[promptMode];

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
            {copy.title}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#64748b]">{copy.description}</p>
        </div>

        <div className="px-6 py-5">
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f172a] py-3 text-[14px] font-semibold text-white transition hover:bg-[#1e293b] disabled:opacity-50"
          >
            <GitBranch className="size-4" strokeWidth={1.75} aria-hidden />
            {isLoading ? '로딩 중...' : copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GitHubAppInstallPromptDialog;
