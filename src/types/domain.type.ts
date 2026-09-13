import { z } from 'zod';
import {
  certificateStatusSchema,
  domainStatusSchema,
  domainTypeSchema,
  hostingTargetSchema,
  verificationMethodSchema,
} from '@/types/common.enum';

/**
 * POST /projects/{projectId}/domains 도메인 연결 요청
 */
const postProjectDomainBindReqSchema = z.object({
  /** 도메인 유형 */
  type: domainTypeSchema,
  /** 서브도메인 라벨. 없으면 null */
  label: z.string().nullable().prefault(''),
  /** 호스트명. 없으면 null */
  hostname: z.string().nullable().prefault(''),
  /** DNS 검증 방식. 없으면 null */
  verificationMethod: verificationMethodSchema.nullable().prefault(null),
  /** 호스팅 대상. 없으면 null */
  hostingTarget: hostingTargetSchema.nullable().prefault(null),
});

const domainBindingSubmissionSchema = z.object({
  /** 태스크 ID */
  taskId: z.string().prefault(''),
  /** 태스크 상태 */
  status: z.string().prefault(''),
  /** 승인 ID 목록 */
  approvalIds: z.array(z.number().int()),
});

const domainSchema = z.object({
  /** 도메인 ID */
  domainId: z.number().int(),
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 도메인 유형 */
  type: domainTypeSchema,
  /** 호스팅 대상 */
  hostingTarget: hostingTargetSchema,
  /** 호스트명 */
  hostname: z.string().prefault(''),
  /** 도메인 상태 */
  status: domainStatusSchema,
  /** DNS 검증 방식. 없으면 null */
  verificationMethod: verificationMethodSchema.nullable().prefault(null),
  /** DNS 타깃. 없으면 null */
  dnsTarget: z.string().nullable().prefault(''),
  /** HTTPS 강제 여부 */
  httpsEnforced: z.boolean(),
  /**
   * 이 도메인이 실제로 가리키는 서버.
   *
   * 저장값이 아니라 응답 시점에 지금 도는 서버에서 유도된다 — 서버가 교체돼도 낡지
   * 않고 늘 현재 것을 가리킨다. 대신 그 서버가 잠깐 안 돌 때는(교체·재기동) null 이다.
   *
   * EC2 를 안 쓰는 대상(GitHub Pages·S3)은 가리킬 서버가 없어 항상 null 이다.
   */
  serverId: z.number().int().nullable().prefault(null),
  /** 인증서 상태. 없으면 null */
  certificateStatus: certificateStatusSchema.nullable().prefault(null),
  /** 인증서 만료 시각. 없으면 null */
  certificateExpiresAt: z.string().nullable().prefault(''),
  /** 마지막 확인 시각. 없으면 null */
  lastCheckedAt: z.string().nullable().prefault(''),
  /** 생성 시각 */
  createdAt: z.string().prefault(''),
  /** 수정 시각 */
  updatedAt: z.string().prefault(''),
});

/**
 * GET /domains/hosting-targets — 이 서버가 실제로 붙일 수 있는 호스팅 대상.
 *
 * enum 이나 OpenAPI 스펙보다 정확하다. **어댑터가 등록된 것만** 담기기 때문이다 —
 * enum 에 있어도 어댑터가 없으면(GCP 가 그렇다) 고르는 순간 실패하는데, 이 목록에는
 * 아예 안 들어온다.
 *
 * 값을 닫지 않는다. 대상이 늘어나는 것은 서버 배포이고, FE 가 목록을 들고 있으면 늘
 * 때마다 배포가 한 번 더 필요해진다 — 오늘 실제로 그 어긋남이 운영에 나갔었다.
 */
const getHostingTargetsResSchema = z.object({
  hostingTargets: z.array(z.string()).prefault([]),
});

const getProjectDomainListResSchema = z.array(domainSchema);

const dnsRecordSchema = z.object({
  /** 레코드 유형 */
  type: z.string().prefault(''),
  /** 호스트 */
  host: z.string().prefault(''),
  /** 값 */
  value: z.string().prefault(''),
});

const getDomainVerificationGuideResSchema = z.object({
  /** 호스트명 */
  hostname: z.string().prefault(''),
  /** DNS 검증 방식 */
  verificationMethod: verificationMethodSchema,
  /** DNS 레코드 목록 */
  records: z.array(dnsRecordSchema),
});

const domainSearchResultSchema = z.object({
  /** 도메인 유형 */
  type: domainTypeSchema,
  /** 호스트명 */
  hostname: z.string().prefault(''),
  /** 사용 가능 여부 */
  available: z.boolean(),
  /** 가격. 없으면 null */
  price: z.number().nullable().prefault(null),
  /** 통화. 없으면 null */
  currency: z.string().nullable().prefault(''),
});

const getDomainSearchResSchema = z.object({
  /** 검색 키워드 */
  keyword: z.string().prefault(''),
  /** 검색 결과 */
  results: z.array(domainSearchResultSchema),
});

type PostProjectDomainBindReqType = z.infer<typeof postProjectDomainBindReqSchema>;
type DomainBindingSubmission = z.infer<typeof domainBindingSubmissionSchema>;
type Domain = z.infer<typeof domainSchema>;
type GetHostingTargetsResType = z.infer<typeof getHostingTargetsResSchema>;
type GetProjectDomainListResType = z.infer<typeof getProjectDomainListResSchema>;
type GetDomainVerificationGuideResType = z.infer<typeof getDomainVerificationGuideResSchema>;
type GetDomainSearchResType = z.infer<typeof getDomainSearchResSchema>;

export {
  getHostingTargetsResSchema,
  type GetHostingTargetsResType,
  postProjectDomainBindReqSchema,
  domainBindingSubmissionSchema,
  domainSchema,
  getProjectDomainListResSchema,
  dnsRecordSchema,
  getDomainVerificationGuideResSchema,
  domainSearchResultSchema,
  getDomainSearchResSchema,
  type PostProjectDomainBindReqType,
  type DomainBindingSubmission,
  type Domain,
  type GetProjectDomainListResType,
  type GetDomainVerificationGuideResType,
  type GetDomainSearchResType,
};
