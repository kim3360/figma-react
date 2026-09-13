import { redirect } from '@tanstack/react-router';

export function requireAuth() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw redirect({ to: '/' });
  }
}
