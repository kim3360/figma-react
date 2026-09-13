import { toSafeHttpUrl } from '@/lib/safeUrl';
import type { ConversationMessage } from '@/types/chat.type';
import type { ProjectPreviewSessionStatus } from '@/types/preview.type';

export type AgentPreviewPhase = 'empty' | 'building' | 'ready' | 'unavailable';

/**
 * 열람 권한 발급(POST /preview-sessions/{id}/access) 응답의 previewUrl을 iframe에 넣을 절대 주소로 바꾼다.
 * Agent 태스크 응답의 previewUrl이 아니다 — 그쪽은 토큰이 회전되어 이미 무효일 수 있다.
 *
 * 게이트웨이는 현재 항상 절대 URL을 준다(`QEPLOY_PREVIEW_GATEWAY_BASE_URL` + 경로).
 * 아래 상대 경로 분기는 방어용이고, 프리뷰가 같은 오리진이라는 보장이 되지 못한다.
 * iframe이 열리는 근거는 그 설정값이 페이지와 같은 오리진이라는 것 하나다 — 게이트웨이를
 * 별도 도메인으로 분리하면 CSP frame-ancestors에 막혀 조용히 빈 화면이 된다.
 * cross-origin iframe이라 FE는 그 실패를 감지할 수 없으니, 분리 시 서버 쪽 설정을 같이 넓혀야 한다.
 *
 * 반환값은 iframe src 와 "새 탭에서 보기" href 양쪽에 들어가므로 http(s) 만 통과시킨다.
 * javascript: 스킴은 iframe src 로도 실행되므로 여기서 걸러야 한다.
 */
export function resolvePreviewFrameUrl(accessPreviewUrl?: string | null): string {
  const raw = accessPreviewUrl?.trim() ?? '';
  if (!raw) return '';

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return toSafeHttpUrl(raw) ?? '';
  }

  const apiBase = import.meta.env.VITE_API_URL as string;
  try {
    const origin = new URL(apiBase, window.location.origin).origin;
    const absolute = raw.startsWith('/')
      ? `${origin}${raw}`
      : `${apiBase.replace(/\/$/, '')}/${raw}`;
    return toSafeHttpUrl(absolute) ?? '';
  } catch {
    return '';
  }
}

type DeriveAgentPreviewPhaseInput = {
  previewUrl: string;
  sessionStatus?: ProjectPreviewSessionStatus | null;
  messages?: ConversationMessage[];
};

export function deriveAgentPreviewPhase({
  previewUrl,
  sessionStatus,
}: DeriveAgentPreviewPhaseInput): AgentPreviewPhase {
  if (sessionStatus === 'ACTIVE' && previewUrl.trim()) return 'ready';
  if (sessionStatus === 'PROVISIONING') return 'building';
  if (sessionStatus === 'FAILED') return 'unavailable';
  return 'empty';
}
