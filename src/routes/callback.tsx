import { createFileRoute, redirect } from '@tanstack/react-router';

/** 레거시 OAuth callback 경로 — 홈으로 리다이렉트 */
export const Route = createFileRoute('/callback')({
  beforeLoad: () => {
    throw redirect({ to: '/home', replace: true });
  },
});
