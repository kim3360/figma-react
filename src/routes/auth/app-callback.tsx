import { useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { completeGitHubAppCallback } from '@/api/auth';
import { GITHUB_APP_INSTALL_SUCCESS_MESSAGE } from '@/constants/githubOAuth';

type AppCallbackSearch = {
  installation_id?: string;
  setup_action?: string;
  state?: string;
};

export const Route = createFileRoute('/auth/app-callback')({
  validateSearch: (search: Record<string, unknown>): AppCallbackSearch => ({
    installation_id:
      typeof search.installation_id === 'string' ? search.installation_id : undefined,
    setup_action: typeof search.setup_action === 'string' ? search.setup_action : undefined,
    state: typeof search.state === 'string' ? search.state : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();

  useEffect(() => {
    let cancelled = false;

    async function finishAppCallback() {
      try {
        await completeGitHubAppCallback({
          installation_id: search.installation_id,
          setup_action: search.setup_action,
          state: search.state,
        });
      } catch {
        // 백엔드가 브라우저 리다이렉트로 이미 처리한 경우에도 팝업은 닫는다.
      }

      if (cancelled) return;

      const payload = { type: GITHUB_APP_INSTALL_SUCCESS_MESSAGE };

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, window.location.origin);
      }

      window.close();
    }

    void finishAppCallback();

    return () => {
      cancelled = true;
    };
  }, [search.installation_id, search.setup_action, search.state]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#A8B88C]/20 border-t-[#A8B88C]" />
      <p className="text-base font-medium">완료 중입니다...</p>
    </div>
  );
}
