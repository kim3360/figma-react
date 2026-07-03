import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/app-callback')({
  beforeLoad: () => {
    throw redirect({ to: '/home', replace: true });
  },
});
