import { useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { GITHUB_APP_INSTALL_SUCCESS_MESSAGE } from '@/constants/githubOAuth';

export const Route = createFileRoute('/auth/app-callback')({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    const payload = { type: GITHUB_APP_INSTALL_SUCCESS_MESSAGE };

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(payload, window.location.origin);
    }

    window.close();
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#A8B88C]/20 border-t-[#A8B88C]" />
      <p className="text-base font-medium">완료 중입니다...</p>
    </div>
  );
}
