import { useCallback, useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { completeGitHubCallback } from '@/api/auth';
import { fetchAndPersistUserInfo } from '@/api/user';
import { finishGitHubLogin } from '@/lib/finishGitHubLogin';
import { handleGitHubOAuthSuccess } from '@/lib/handleGitHubOAuthSuccess';
import { persistAuthTokens } from '@/lib/persistAuthTokens';
import {
  clearOAuthState,
  getOAuthState,
  isOAuthCodeProcessed,
  markOAuthCodeProcessed,
} from '@/services/auth/oauthState';

type CallbackSearch = {
  code: string;
  state: string;
};

/** React StrictMode 개발 환경에서 callback API 중복 호출 방지 */
let exchangingOAuthCode: string | null = null;

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    code: typeof search.code === 'string' ? search.code : '',
    state: typeof search.state === 'string' ? search.state : '',
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { code, state } = Route.useSearch();

  const handleCallback = useCallback(async () => {
    if (!code || !state) {
      setErrorMessage('인증 정보(code/state)가 없습니다.');
      return;
    }

    if (isOAuthCodeProcessed(code)) {
      await handleGitHubOAuthSuccess();
      finishGitHubLogin();
      return;
    }

    if (exchangingOAuthCode === code) {
      return;
    }

    exchangingOAuthCode = code;

    const savedState = getOAuthState();
    if (savedState && savedState !== state) {
      exchangingOAuthCode = null;
      clearOAuthState();
      setErrorMessage('로그인 요청이 유효하지 않습니다. 다시 시도해 주세요.');
      return;
    }

    try {
      const response = await completeGitHubCallback({ code, state });

      persistAuthTokens(response);
      await fetchAndPersistUserInfo();
      markOAuthCodeProcessed(code);
      clearOAuthState();
      finishGitHubLogin();
    } catch (error) {
      exchangingOAuthCode = null;
      setErrorMessage(error instanceof Error ? error.message : '로그인 처리에 실패했습니다.');
    }
  }, [code, state]);

  useEffect(() => {
    void handleCallback();
  }, [handleCallback]);

  if (errorMessage) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-base font-medium text-red-600">{errorMessage}</p>
        <p className="text-sm text-slate-500">
          로그인을 처음부터 다시 시도해 주세요. callback 주소를 새로고침하면 code가 만료됩니다.
        </p>
        <button
          type="button"
          className="text-sm text-slate-600 underline"
          onClick={() => navigate({ to: '/' })}
        >
          홈 화면으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7C3AED]/20 border-t-[#7C3AED]" />
      <p className="text-base font-medium">로그인 처리 중입니다...</p>
      <p className="text-sm text-gray-500">잠시만 기다려 주세요</p>
    </div>
  );
}
