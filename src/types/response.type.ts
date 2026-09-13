import { z } from 'zod';

/**
 * 응답 스키마 규칙 — `.min(1, ...)` 를 응답 필드에 걸지 않는다.
 *
 * `z.string().min(1, '...').prefault('')` 는 폴백을 마련해둔 것처럼 보이지만 정반대로
 * 동작한다. prefault 가 빈 값을 `''` 로 채우면 그 `''` 를 곧바로 min(1) 이 거절해서,
 * 필드 하나가 비었을 뿐인데 응답 전체의 파싱이 실패한다. 그 실패가 곁다리 조회 경로에
 * 걸리면 화면에는 아무 표시도 나지 않는다 — 서버가 개요에서 `trafficSummary` 를 뺐을 때
 * 실제로 프로젝트 상세가 조용히 비어 있었다.
 *
 * 그래서 응답 필드는 값이 없을 수 있다고 보고 `.prefault('')` 나 `.nullable()` 만 쓴다.
 * 값이 비었는지는 화면이 판단한다. 서버가 필드를 하나 빼거나 비웠다고 해서 화면이
 * 통째로 죽을 이유는 없다.
 *
 * 반대로 **요청(`...ReqSchema`)과 경로 파라미터(`...ParamsSchema`)에서는 min(1) 이
 * 맞다.** 거기서는 빈 값이 진짜 오류다 — 사용자가 이름을 안 적었거나, 빈 id 로 URL 을
 * 만들려는 것이라 파싱을 실패시키는 게 목적이다.
 */

/**
 * API 에러 본문
 */
const apiErrorBodySchema = z.object({
  /** 서버 에러 메시지 */
  message: z.string().prefault(''),
});

/** API 에러 본문 */
type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

type ApiResponse<T> = {
  status: number;
  code: string;
  message: string;
  data?: T;
};

export { apiErrorBodySchema, type ApiErrorBody, type ApiResponse };
