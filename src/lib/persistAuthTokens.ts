import type { GitHubCallbackResult } from '@/types/auth.type';
import type { ApiResponse } from '@/types/response.type';

function normalizeToken(token: unknown): string | undefined {
  if (typeof token === 'string' && token.length > 0) return token;
  if (token && typeof token === 'object' && 'value' in token) {
    const value = (token as { value?: unknown }).value;
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
  return undefined;
}

function extractCallbackPayload(
  response?: ApiResponse<GitHubCallbackResult> | GitHubCallbackResult,
): GitHubCallbackResult | undefined {
  if (!response || typeof response !== 'object') return undefined;

  const record = response as Record<string, unknown>;
  const nested = record.data ?? record.result;

  if (nested && typeof nested === 'object') {
    return nested as GitHubCallbackResult;
  }

  return response as GitHubCallbackResult;
}

export function persistAuthTokens(
  response?: ApiResponse<GitHubCallbackResult> | GitHubCallbackResult,
) {
  const data = extractCallbackPayload(response);
  if (!data) return;

  const accessToken = normalizeToken(data.accessToken);
  const refreshToken = normalizeToken(data.refreshToken);

  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
}
