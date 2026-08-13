import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cloudConnectionHealthSchema,
  cloudConnectionSchema,
  cloudVerificationJobSchema,
  createCloudConnectionReqSchema,
  createCloudConnectionResSchema,
  type CreateCloudConnectionReqType,
} from '@/types/cloudConnection.type';
import {
  dummyCreateCloudConnection,
  dummyCreateVerificationJob,
  dummyDeleteCloudConnection,
  dummyGetCloudConnection,
  dummyGetCloudHealth,
  dummyGetVerificationJob,
  dummyListCloudConnections,
} from '@/mocks/fixtures/dummyExtraApis';

const opts = { gcTime: 0, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false } as const;

async function listCloudConnections() {
  return cloudConnectionSchema.array().parse(dummyListCloudConnections());
}

async function getCloudConnection(id: number) {
  return cloudConnectionSchema.parse(dummyGetCloudConnection(id));
}

async function createCloudConnection(params: CreateCloudConnectionReqType) {
  const payload = createCloudConnectionReqSchema.parse(params);
  return createCloudConnectionResSchema.parse(dummyCreateCloudConnection(payload));
}

async function deleteCloudConnection(id: number) {
  dummyDeleteCloudConnection(id);
}

async function getCloudHealth(id: number) {
  return cloudConnectionHealthSchema.parse(dummyGetCloudHealth(id));
}

async function createVerificationJob(id: number) {
  return cloudVerificationJobSchema.parse(dummyCreateVerificationJob(id));
}

async function getVerificationJob(jobId: string) {
  return cloudVerificationJobSchema.parse(dummyGetVerificationJob(jobId));
}

function useCloudConnectionsQuery(queryKey: unknown) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['cloud-connections', queryKey],
    queryFn: listCloudConnections,
    ...opts,
  });
}

function useCreateCloudConnectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCloudConnection,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['cloud-connections'] });
    },
  });
}

function useDeleteCloudConnectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCloudConnection,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['cloud-connections'] });
    },
  });
}

function useCreateVerificationJobMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createVerificationJob,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['cloud-connections'] });
    },
  });
}

export {
  listCloudConnections,
  getCloudConnection,
  createCloudConnection,
  deleteCloudConnection,
  getCloudHealth,
  createVerificationJob,
  getVerificationJob,
  useCloudConnectionsQuery,
  useCreateCloudConnectionMutation,
  useDeleteCloudConnectionMutation,
  useCreateVerificationJobMutation,
};
