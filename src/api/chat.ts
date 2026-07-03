import Http from '@/utils/httpClients';
import { useQuery } from '@tanstack/react-query';
import { errorResponse, succesResponse } from '@/utils/response';
import {
  deleteConversationParamsSchema,
  getConversationDetailParamsSchema,
  getConversationDetailResSchema,
  getConversationMessageListParamsSchema,
  getConversationMessageListResSchema,
  postConversationMessageCreateReqSchema,
  postConversationMessageCreateResSchema,
  getProjectConversationListParamsSchema,
  getProjectConversationListResSchema,
  postProjectConversationCreateParamsSchema,
  postProjectConversationCreateResSchema,
  getTrashConversationListResSchema,
  postTrashConversationRestoreParamsSchema,
  postTrashConversationRestoreResSchema,
  type GetConversationDetailResType,
  type GetTrashConversationListResType,
  type GetConversationMessageListResType,
  type PostConversationMessageCreateReqType,
  type PostConversationMessageCreateResType,
  type GetProjectConversationListResType,
  type PostProjectConversationCreateResType,
  type PostTrashConversationRestoreResType,
} from '@/types/chat.type';

const projectsEndpoint = '/projects';
const conversationsEndpoint = '/conversations';
const trashEndpoint = '/trash';

/** 대화 상세 조회 API GET */
async function getConversationDetail(conversationId: number) {
  const { conversationId: id } = getConversationDetailParamsSchema.parse({
    conversationId,
  });

  return Http.instance
    .get<GetConversationDetailResType>(`${conversationsEndpoint}/${id}`)
    .then((response) => {
      const data = succesResponse<GetConversationDetailResType>(response);
      return getConversationDetailResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 대화 메시지 목록 조회 API GET */
async function getConversationMessageList(conversationId: number) {
  const { conversationId: id } = getConversationMessageListParamsSchema.parse({
    conversationId,
  });

  return Http.instance
    .get<GetConversationMessageListResType>(`${conversationsEndpoint}/${id}/messages`)
    .then((response) => {
      const data = succesResponse<GetConversationMessageListResType>(response);
      return getConversationMessageListResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 대화 메시지 생성 API POST */
async function postConversationMessageCreate(
  conversationId: number,
  params: PostConversationMessageCreateReqType,
) {
  const { conversationId: id } = getConversationMessageListParamsSchema.parse({
    conversationId,
  });
  const payload = postConversationMessageCreateReqSchema.parse(params);

  return Http.instance
    .post<PostConversationMessageCreateResType>(`${conversationsEndpoint}/${id}/messages`, payload)
    .then((response) => {
      const data = succesResponse<PostConversationMessageCreateResType>(response);
      return postConversationMessageCreateResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 프로젝트 대화 목록 조회 API GET */
async function getProjectConversationList(projectId: number) {
  const { projectId: id } = getProjectConversationListParamsSchema.parse({ projectId });

  return Http.instance
    .get<GetProjectConversationListResType>(`${projectsEndpoint}/${id}/conversations`)
    .then((response) => {
      const data = succesResponse<GetProjectConversationListResType>(response);
      return getProjectConversationListResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 프로젝트 대화 생성 API POST */
async function postProjectConversationCreate(projectId: number) {
  const { projectId: id } = postProjectConversationCreateParamsSchema.parse({
    projectId,
  });

  return Http.instance
    .post<PostProjectConversationCreateResType>(`${projectsEndpoint}/${id}/conversations`)
    .then((response) => {
      const data = succesResponse<PostProjectConversationCreateResType>(response);
      return postProjectConversationCreateResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 대화 삭제 API DELETE */
async function deleteConversation(conversationId: number) {
  const { conversationId: id } = deleteConversationParamsSchema.parse({
    conversationId,
  });

  return Http.instance
    .delete(`${conversationsEndpoint}/${id}`)
    .then(succesResponse)
    .catch(errorResponse());
}

/** 휴지통 대화 목록 조회 API GET */
async function getTrashConversationList() {
  return Http.instance
    .get<GetTrashConversationListResType>(`${trashEndpoint}/conversations`)
    .then((response) => {
      const data = succesResponse<GetTrashConversationListResType>(response);
      return getTrashConversationListResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 휴지통 대화 복구 API POST */
async function postTrashConversationRestore(conversationId: number) {
  const { conversationId: id } = postTrashConversationRestoreParamsSchema.parse({
    conversationId,
  });

  return Http.instance
    .post<PostTrashConversationRestoreResType>(`${trashEndpoint}/conversations/${id}/restore`)
    .then((response) => {
      const data = succesResponse<PostTrashConversationRestoreResType>(response);
      return postTrashConversationRestoreResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 대화 상세 조회 Query Hook */
function useConversationDetailQuery(queryKey: unknown, conversationId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['conversation-detail', queryKey, conversationId],
    queryFn: () => getConversationDetail(conversationId),
    enabled: Number.isInteger(conversationId) && conversationId > 0,
    gcTime: 0,
  });
}

/** 대화 메시지 목록 조회 Query Hook */
function useConversationMessageListQuery(queryKey: unknown, conversationId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['conversation-message-list', queryKey, conversationId],
    queryFn: () => getConversationMessageList(conversationId),
    enabled: Number.isInteger(conversationId) && conversationId > 0,
    gcTime: 0,
  });
}

/** 프로젝트 대화 목록 조회 Query Hook */
function useProjectConversationListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-conversation-list', queryKey, projectId],
    queryFn: () => getProjectConversationList(projectId),
    enabled: Number.isInteger(projectId),
    gcTime: 0,
  });
}

/** 휴지통 대화 목록 조회 Query Hook */
function useTrashConversationListQuery(queryKey: unknown, enabled = true) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['trash-conversation-list', queryKey],
    queryFn: getTrashConversationList,
    enabled,
    gcTime: 0,
  });
}

export {
  getConversationDetail,
  getConversationMessageList,
  postConversationMessageCreate,
  getProjectConversationList,
  postProjectConversationCreate,
  deleteConversation,
  getTrashConversationList,
  postTrashConversationRestore,
  useConversationDetailQuery,
  useConversationMessageListQuery,
  useProjectConversationListQuery,
  useTrashConversationListQuery,
};
