import Http from '@/utils/httpClients';
import { useQuery } from '@tanstack/react-query';
import { errorResponse, succesResponse } from '@/utils/response';
import type { ApiResponse } from '@/types/response.type';
import {
  getChangeDetailResSchema,
  getChangeDiffResSchema,
  getProjectChangeListResSchema,
  type GetChangeDetailResType,
  type GetChangeDiffResType,
  type GetProjectChangeListResType,
} from '@/types/change.type';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

function unwrapApiData<T>(body: T | ApiResponse<T>): T {
  if (body && typeof body === 'object' && 'data' in body && body.data != null) {
    return body.data;
  }
  return body as T;
}

/** 프로젝트 Change 목록 조회 API GET */
async function getProjectChangeList(projectId: number) {
  return Http.instance
    .get<ApiResponse<GetProjectChangeListResType>>(`/projects/${projectId}/changes`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectChangeListResType>>(response);
      return getProjectChangeListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** Change 상세 조회 API GET */
async function getChangeDetail(changeId: number) {
  return Http.instance
    .get<GetChangeDetailResType>(`/changes/${changeId}`)
    .then((response) => {
      const data = succesResponse<GetChangeDetailResType>(response);
      return getChangeDetailResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** Change diff 조회 API GET */
async function getChangeDiff(changeId: number) {
  return Http.instance
    .get<GetChangeDiffResType>(`/changes/${changeId}/diff`)
    .then((response) => {
      const data = succesResponse<GetChangeDiffResType>(response);
      return getChangeDiffResSchema.parse(data);
    })
    .catch(errorResponse());
}

function useProjectChangeListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-change-list', queryKey, projectId],
    queryFn: () => getProjectChangeList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

export { getProjectChangeList, getChangeDetail, getChangeDiff, useProjectChangeListQuery };
