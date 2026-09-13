import Http from '@/utils/httpClients';
import { useQuery } from '@tanstack/react-query';
import { errorResponse, succesResponse, unwrapApiData } from '@/utils/response';
import type { ApiResponse } from '@/types/response.type';
import {
  previewRuntimeConfigSchema,
  putPreviewRuntimeReqSchema,
  type PreviewRuntimeConfig,
  type PutPreviewRuntimeReqType,
} from '@/types/previewRuntime.type';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

/** 프리뷰 런타임 설정 조회 API GET. 저장된 설정이 없으면 source=DEFAULT 로 STATIC 이 온다 */
async function getPreviewRuntimeConfig(projectId: number) {
  return Http.instance
    .get<ApiResponse<PreviewRuntimeConfig>>(`/projects/${projectId}/preview/runtime`)
    .then((response) => {
      const body = succesResponse<ApiResponse<PreviewRuntimeConfig>>(response);
      return previewRuntimeConfigSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프리뷰 런타임 설정 저장 API PUT. JAVA_FULLSTACK 은 서버가 400 으로 거부한다 */
async function putPreviewRuntimeConfig(projectId: number, params: PutPreviewRuntimeReqType) {
  const payload = putPreviewRuntimeReqSchema.parse(params);

  return Http.instance
    .put<ApiResponse<PreviewRuntimeConfig>>(`/projects/${projectId}/preview/runtime`, payload)
    .then((response) => {
      const body = succesResponse<ApiResponse<PreviewRuntimeConfig>>(response);
      return previewRuntimeConfigSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/**
 * 프리뷰 런타임 설정 조회 Query Hook.
 * DB 섹션도 같은 키로 읽어 수동 생성 노출 여부를 판단한다 — react-query 가 요청을 합친다.
 */
function usePreviewRuntimeConfigQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['preview-runtime-config', queryKey, projectId],
    queryFn: () => getPreviewRuntimeConfig(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

export { getPreviewRuntimeConfig, putPreviewRuntimeConfig, usePreviewRuntimeConfigQuery };
