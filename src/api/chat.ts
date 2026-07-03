import { useQuery } from '@tanstack/react-query';
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
  type PostConversationMessageCreateReqType,
} from '@/types/chat.type';
import {
  dummyDeleteConversation,
  dummyGetConversationDetail,
  dummyGetConversationMessageList,
  dummyGetProjectConversationList,
  dummyGetTrashConversationList,
  dummyPostConversationMessageCreate,
  dummyPostProjectConversationCreate,
  dummyPostTrashConversationRestore,
} from '@/mocks/fixtures/dummyData';

async function getConversationDetail(conversationId: number) {
  const { conversationId: id } = getConversationDetailParamsSchema.parse({ conversationId });
  const data = dummyGetConversationDetail(id);
  return getConversationDetailResSchema.parse(data);
}

async function getConversationMessageList(conversationId: number) {
  const { conversationId: id } = getConversationMessageListParamsSchema.parse({ conversationId });
  const data = dummyGetConversationMessageList(id);
  return getConversationMessageListResSchema.parse(data);
}

async function postConversationMessageCreate(
  conversationId: number,
  params: PostConversationMessageCreateReqType,
) {
  const { conversationId: id } = getConversationMessageListParamsSchema.parse({ conversationId });
  const payload = postConversationMessageCreateReqSchema.parse(params);
  const data = dummyPostConversationMessageCreate(id, payload);
  return postConversationMessageCreateResSchema.parse(data);
}

async function getProjectConversationList(projectId: number) {
  const { projectId: id } = getProjectConversationListParamsSchema.parse({ projectId });
  const data = dummyGetProjectConversationList(id);
  return getProjectConversationListResSchema.parse(data);
}

async function postProjectConversationCreate(projectId: number) {
  const { projectId: id } = postProjectConversationCreateParamsSchema.parse({ projectId });
  const data = dummyPostProjectConversationCreate(id);
  return postProjectConversationCreateResSchema.parse(data);
}

async function deleteConversation(conversationId: number) {
  const { conversationId: id } = deleteConversationParamsSchema.parse({ conversationId });
  dummyDeleteConversation(id);
}

async function getTrashConversationList() {
  const data = dummyGetTrashConversationList();
  return getTrashConversationListResSchema.parse(data);
}

async function postTrashConversationRestore(conversationId: number) {
  const { conversationId: id } = postTrashConversationRestoreParamsSchema.parse({ conversationId });
  const data = dummyPostTrashConversationRestore(id);
  return postTrashConversationRestoreResSchema.parse(data);
}

function useConversationDetailQuery(queryKey: unknown, conversationId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['conversation-detail', queryKey, conversationId],
    queryFn: () => getConversationDetail(conversationId),
    enabled: Number.isInteger(conversationId) && conversationId > 0,
    gcTime: 0,
  });
}

function useConversationMessageListQuery(queryKey: unknown, conversationId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['conversation-message-list', queryKey, conversationId],
    queryFn: () => getConversationMessageList(conversationId),
    enabled: Number.isInteger(conversationId) && conversationId > 0,
    gcTime: 0,
  });
}

function useProjectConversationListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-conversation-list', queryKey, projectId],
    queryFn: () => getProjectConversationList(projectId),
    enabled: Number.isInteger(projectId),
    gcTime: 0,
  });
}

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
