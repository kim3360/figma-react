import { AxiosError, type AxiosResponse } from 'axios';

export function succesResponse<T>(res: AxiosResponse<T>) {
  return res.data;
}

/**
 * 서버가 분류해 준 오류.
 *
 * 봉투(`{status, code, message, data}`)의 `code` 를 들고 다닌다. 예전에는 평범한
 * Error 로 던져서 message 만 남고 code 가 버려졌는데, 그러면 화면이 "왜 실패했는지"를
 * 알 수 없어 서버 문장을 그대로 띄우는 것 말고는 할 수 있는 게 없다. 코드가 있으면
 * "다른 AI 제공자를 고르세요" 처럼 다음 행동을 붙일 수 있다.
 *
 * message 는 그대로라 기존 호출부(`error.message`)는 아무것도 바뀌지 않는다.
 */
export class ApiError extends Error {
  readonly code: string | null;

  constructor(message: string, code: string | null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

/** API envelope의 message 필드만 꺼낸다. JSON 전체는 노출하지 않는다. */
export function extractApiErrorMessage(error: unknown) {
  return readMessageField(asErrorPayload(error));
}

/**
 * 서버가 붙인 오류 코드를 꺼낸다. 없으면 null — 네트워크 오류나 스키마 실패처럼
 * 서버가 분류하지 않은 실패가 그렇다.
 */
export function extractApiErrorCode(error: unknown): string | null {
  if (error instanceof ApiError) return error.code;
  if (error instanceof AxiosError) return readCodeField(error.response?.data);
  return null;
}

function readCodeField(value: unknown): string | null {
  if (!value || typeof value !== 'object' || !('code' in value)) return null;

  const code = (value as { code: unknown }).code;
  if (typeof code !== 'string') return null;

  const trimmed = code.trim();
  return trimmed ? trimmed : null;
}

function asErrorPayload(error: unknown): unknown {
  if (error instanceof AxiosError) return error.response?.data ?? error.message;
  if (error instanceof Error) return error.message;
  return error;
}

function readMessageField(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return readMessageField(JSON.parse(trimmed) as unknown);
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  if (value && typeof value === 'object' && 'message' in value) {
    return readMessageField((value as { message: unknown }).message);
  }

  return null;
}

/**
 * API 봉투(`{status, code, message, data}`)에서 data 를 꺼낸다.
 * 봉투 없이 본문만 오는 응답도 있어 그 경우는 그대로 돌려준다.
 *
 * `data` 키가 있으면 값이 null 이어도 벗긴다. 예전에는 `data != null` 을 함께 봤는데,
 * 그러면 "선택된 연결 없음" 처럼 서버가 `data: null` 을 주는 정상 응답에서 봉투가 그대로
 * 스키마로 넘어갔다. 봉투의 status 는 HTTP 코드(200)라 enum 자리에 숫자가 들어가고,
 * 원인과 무관한 곳에서 파싱이 터진다.
 */
export function unwrapApiData<T>(body: T | { data?: T }): T {
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data?: T }).data as T;
  }
  return body as T;
}

/**
 * 서버는 200 을 주는데 zod 파싱이 실패하면 여기로 온다. 그 실패가 조용히 삼켜져
 * 화면만 비는 사고가 반복돼서(도메인 목록·프로젝트 개요·활동 이력) 개발 모드에서는
 * 흔적을 남긴다. 사용자에게 보이는 메시지는 그대로 둔다.
 */
export function errorResponse() {
  return (err: unknown) => {
    if (import.meta.env.DEV && !(err instanceof AxiosError)) {
      console.warn('[api] 응답 처리 실패 — 스키마 불일치일 수 있습니다', err);
    }
    throw new ApiError(
      extractApiErrorMessage(err) ?? '요청 처리 중 오류가 발생했습니다.',
      extractApiErrorCode(err),
    );
  };
}
