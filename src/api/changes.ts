import { useQuery } from '@tanstack/react-query';
import {
  changeDiffSchema,
  changeSchema,
  getProjectChangeListResSchema,
  type GetChangeDetailResType,
  type GetChangeDiffResType,
  type GetProjectChangeListResType,
} from '@/types/changes.type';
import {
  dummyGetChangeDetail,
  dummyGetChangeDiff,
  dummyGetProjectChangeList,
} from '@/mocks/fixtures/dummyProjectApi';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

async function getProjectChangeList(projectId: number): Promise<GetProjectChangeListResType> {
  return getProjectChangeListResSchema.parse(dummyGetProjectChangeList(projectId));
}

async function getChangeDetail(changeId: number): Promise<GetChangeDetailResType> {
  return changeSchema.parse(dummyGetChangeDetail(changeId));
}

async function getChangeDiff(changeId: number): Promise<GetChangeDiffResType> {
  return changeDiffSchema.parse(dummyGetChangeDiff(changeId));
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

function useChangeDiffQuery(queryKey: unknown, changeId: number | null) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['change-diff', queryKey, changeId],
    queryFn: () => getChangeDiff(changeId!),
    enabled: changeId != null && changeId > 0,
    ...defaultQueryOptions,
  });
}

export {
  getProjectChangeList,
  getChangeDetail,
  getChangeDiff,
  useProjectChangeListQuery,
  useChangeDiffQuery,
};
