export const APP_SHELL_PATHS = [
  '/home',
  '/project',
  '/templates',
  '/analytics',
  '/trash',
  '/settings',
  '/help',
] as const;

export type AppShellPath = (typeof APP_SHELL_PATHS)[number];

export function isAppShellPath(pathname: string): boolean {
  return APP_SHELL_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isAuthPath(pathname: string): boolean {
  return pathname === '/auth' || pathname.startsWith('/auth/');
}

/** 로그인·OAuth 콜백 등 — 사이드바·헤더 없이 본문만 */
export function isAuthLayoutPath(pathname: string): boolean {
  return isAuthPath(pathname) || pathname === '/callback';
}
