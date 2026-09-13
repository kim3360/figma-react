import Http from '@/utils/httpClients';
import { useQuery } from '@tanstack/react-query';
import { errorResponse, succesResponse, unwrapApiData } from '@/utils/response';
import {
  environmentVariableSchema,
  getEnvironmentVariableHistoryListResSchema,
  getEnvironmentVariableListResSchema,
  patchEnvironmentVariableReqSchema,
  postEnvironmentVariableCreateReqSchema,
  type EnvironmentVariable,
  type GetEnvironmentVariableHistoryListResType,
  type GetEnvironmentVariableListResType,
  type PatchEnvironmentVariableReqType,
  type PostEnvironmentVariableCreateReqType,
} from '@/types/environment.type';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

/** 환경변수 목록 조회 API GET */
async function getEnvironmentVariableList(projectId: number) {
  return Http.instance
    .get<GetEnvironmentVariableListResType>(`/projects/${projectId}/environment-variables`)
    .then((response) => {
      const body = succesResponse<GetEnvironmentVariableListResType>(response);
      return getEnvironmentVariableListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 환경변수 생성 API POST */
async function postEnvironmentVariableCreate(
  projectId: number,
  params: PostEnvironmentVariableCreateReqType,
) {
  const payload = postEnvironmentVariableCreateReqSchema.parse(params);

  return Http.instance
    .post<EnvironmentVariable>(`/projects/${projectId}/environment-variables`, payload)
    .then((response) => {
      const body = succesResponse<EnvironmentVariable>(response);
      return environmentVariableSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 환경변수 수정 API PATCH */
async function patchEnvironmentVariable(
  projectId: number,
  variableId: number,
  params: PatchEnvironmentVariableReqType,
) {
  const payload = patchEnvironmentVariableReqSchema.parse(params);

  return Http.instance
    .patch<EnvironmentVariable>(
      `/projects/${projectId}/environment-variables/${variableId}`,
      payload,
    )
    .then((response) => {
      const body = succesResponse<EnvironmentVariable>(response);
      return environmentVariableSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 환경변수 삭제 API DELETE */
async function deleteEnvironmentVariable(projectId: number, variableId: number) {
  return Http.instance
    .delete(`/projects/${projectId}/environment-variables/${variableId}`)
    .then(succesResponse)
    .catch(errorResponse());
}

/** 환경변수 히스토리 조회 API GET */
async function getEnvironmentVariableHistoryList(projectId: number) {
  return Http.instance
    .get<GetEnvironmentVariableHistoryListResType>(
      `/projects/${projectId}/environment-variables/history`,
    )
    .then((response) => {
      const body = succesResponse<GetEnvironmentVariableHistoryListResType>(response);
      return getEnvironmentVariableHistoryListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

function useEnvironmentVariableListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['environment-variable-list', queryKey, projectId],
    queryFn: () => getEnvironmentVariableList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

export {
  getEnvironmentVariableList,
  postEnvironmentVariableCreate,
  patchEnvironmentVariable,
  deleteEnvironmentVariable,
  getEnvironmentVariableHistoryList,
  useEnvironmentVariableListQuery,
};
