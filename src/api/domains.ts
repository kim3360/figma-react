import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bindDomainReqSchema,
  domainBindingSubmissionSchema,
  domainSchema,
  domainSearchSchema,
  verificationGuideSchema,
  type BindDomainReqType,
} from '@/types/domain.type';
import {
  dummyBindDomain,
  dummyGetDomain,
  dummyGetVerificationGuide,
  dummyListDomains,
  dummyRetryDomainVerification,
  dummySearchDomains,
  dummyUnbindDomain,
} from '@/mocks/fixtures/dummyExtraApis';

const opts = { gcTime: 0, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false } as const;

async function listDomains(projectId: number) {
  return domainSchema.array().parse(dummyListDomains(projectId));
}

async function getDomain(domainId: number) {
  return domainSchema.parse(dummyGetDomain(domainId));
}

async function bindDomain(projectId: number, params: BindDomainReqType) {
  const payload = bindDomainReqSchema.parse(params);
  return domainBindingSubmissionSchema.parse(dummyBindDomain(projectId, payload));
}

async function unbindDomain(domainId: number) {
  dummyUnbindDomain(domainId);
}

async function searchDomains(query: string) {
  return domainSearchSchema.parse(dummySearchDomains(query));
}

async function getVerificationGuide(domainId: number) {
  return verificationGuideSchema.parse(dummyGetVerificationGuide(domainId));
}

async function retryDomainVerification(domainId: number) {
  return domainSchema.parse(dummyRetryDomainVerification(domainId));
}

function useProjectDomainsQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-domains', queryKey, projectId],
    queryFn: () => listDomains(projectId),
    enabled: !!projectId,
    ...opts,
  });
}

function useDomainSearchQuery(queryKey: unknown, query: string, enabled = true) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['domain-search', queryKey, query],
    queryFn: () => searchDomains(query),
    enabled,
    ...opts,
  });
}

function useVerificationGuideQuery(queryKey: unknown, domainId: number | null) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['domain-verification-guide', queryKey, domainId],
    queryFn: () => getVerificationGuide(domainId!),
    enabled: domainId != null,
    ...opts,
  });
}

function useBindDomainMutation(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: BindDomainReqType) => bindDomain(projectId, params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project-domains'] });
    },
  });
}

function useUnbindDomainMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unbindDomain,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project-domains'] });
    },
  });
}

function useRetryDomainVerificationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: retryDomainVerification,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project-domains'] });
    },
  });
}

export {
  listDomains,
  getDomain,
  bindDomain,
  unbindDomain,
  searchDomains,
  getVerificationGuide,
  retryDomainVerification,
  useProjectDomainsQuery,
  useDomainSearchQuery,
  useVerificationGuideQuery,
  useBindDomainMutation,
  useUnbindDomainMutation,
  useRetryDomainVerificationMutation,
};
