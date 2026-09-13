import { z } from 'zod';

/**
 * 프리뷰 런타임 타입.
 * 열린 문자열로 받는다 — 서버가 값을 늘릴 여지가 있고, 화면은 아는 값만 라벨로 바꾸면 된다.
 * 닫아두면 값 하나 때문에 응답 전체가 파싱에 실패해 설정 카드가 통째로 빈다.
 */
const previewRuntimeTypeSchema = z.string().min(1, '런타임 타입이 없습니다.').prefault('STATIC');

/** 자동 프로비저닝될 DB 엔진. 서버형일 때만 의미가 있다 */
const previewDbEngineSchema = z.string().nullable().prefault(null);

/**
 * GET|PUT /projects/{projectId}/preview/runtime
 *
 * source 는 이 값이 어디서 왔는지다 — STORED(저장값) · DEFAULT(기본값) · DETECTED(자동감지).
 * 표시용이라 열어둔다. DEFAULT 면 "아직 설정하지 않음"으로 읽는다.
 */
const previewRuntimeConfigSchema = z.object({
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 런타임 타입 */
  runtimeType: previewRuntimeTypeSchema,
  /** 서버형 실행 명령. null 이면 NODE_SERVER 는 npm start */
  startCommand: z.string().nullable().prefault(null),
  /** API 경로 접두사. JAVA_FULLSTACK 용 */
  apiPathPrefix: z.string().nullable().prefault(null),
  /** 헬스체크 경로. 없으면 null */
  healthPath: z.string().nullable().prefault(null),
  /** 자동 프로비저닝될 DB 엔진 */
  dbEngine: previewDbEngineSchema,
  /** 이 값의 출처 */
  source: z.string().nullable().prefault(null),
});

/** PUT 요청. runtimeType 만 필수 */
const putPreviewRuntimeReqSchema = z.object({
  runtimeType: z.string().min(1),
  startCommand: z.string().nullable().optional(),
  apiPathPrefix: z.string().nullable().optional(),
  healthPath: z.string().nullable().optional(),
  dbEngine: z.string().nullable().optional(),
});

type PreviewRuntimeConfig = z.infer<typeof previewRuntimeConfigSchema>;
type PutPreviewRuntimeReqType = z.infer<typeof putPreviewRuntimeReqSchema>;

export {
  previewRuntimeConfigSchema,
  putPreviewRuntimeReqSchema,
  type PreviewRuntimeConfig,
  type PutPreviewRuntimeReqType,
};
