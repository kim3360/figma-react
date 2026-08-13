import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approvalSchema,
  getProjectApprovalListResSchema,
  type GetApprovalDetailResType,
  type GetProjectApprovalListResType,
} from '@/types/approvals.type';
import {
  dummyApprove,
  dummyGetApprovalDetail,
  dummyGetProjectApprovalList,
  dummyReject,
} from '@/mocks/fixtures/dummyProjectApi';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

async function getProjectApprovalList(projectId: number): Promise<GetProjectApprovalListResType> {
  return getProjectApprovalListResSchema.parse(dummyGetProjectApprovalList(projectId));
}

async function getApprovalDetail(approvalId: number): Promise<GetApprovalDetailResType> {
  return approvalSchema.parse(dummyGetApprovalDetail(approvalId));
}

async function approveApproval(approvalId: number) {
  return approvalSchema.parse(dummyApprove(approvalId));
}

async function rejectApproval(approvalId: number) {
  return approvalSchema.parse(dummyReject(approvalId));
}

function useProjectApprovalListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-approval-list', queryKey, projectId],
    queryFn: () => getProjectApprovalList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useApproveApprovalMutation(_projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveApproval,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-approval-list'] });
      await queryClient.invalidateQueries({ queryKey: ['project-detail-bundle'] });
      await queryClient.invalidateQueries({ queryKey: ['project-activity-log-list'] });
    },
  });
}

function useRejectApprovalMutation(_projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectApproval,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-approval-list'] });
      await queryClient.invalidateQueries({ queryKey: ['project-activity-log-list'] });
    },
  });
}

export {
  getProjectApprovalList,
  getApprovalDetail,
  approveApproval,
  rejectApproval,
  useProjectApprovalListQuery,
  useApproveApprovalMutation,
  useRejectApprovalMutation,
};
