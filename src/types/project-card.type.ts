import { z } from 'zod';

/**
 * 프로젝트 카드 배포 상태 (UI)
 * @example "pending"
 */
const projectCardDeployStatusSchema = z.enum(['pending', 'deploying', 'deployed']);

/**
 * 프로젝트 카테고리 (UI)
 * @example "landing"
 */
const projectCategorySchema = z.enum(['landing', 'portfolio', 'business']);

/**
 * 프로젝트 카드 미리보기 변형 (UI)
 * @example "landing"
 */
const previewVariantSchema = z.enum(['landing', 'portfolio', 'business']);

/**
 * 프로젝트 카드 목록·그리드 UI 항목
 */
const projectItemSchema = z.object({
  /** 프로젝트 식별자 */
  id: z.string().min(1, '프로젝트 ID가 없습니다.').prefault(''),
  /** URL 슬러그 */
  slug: z.string().min(1, '슬러그가 없습니다.').prefault(''),
  /** 카드 배포 상태 */
  deployStatus: projectCardDeployStatusSchema,
  /** 프로젝트 카테고리 */
  category: projectCategorySchema,
  /** 템플릿 설정 여부 */
  hasTemplate: z.boolean(),
  /** 카드 부제 */
  subtitle: z.string().min(1, '부제가 없습니다.').prefault(''),
  /** 마지막 수정 시각 표시 */
  updatedAt: z.string().min(1, '수정 시각이 없습니다.').prefault(''),
  /** 미리보기 변형 */
  preview: previewVariantSchema,
});

const projectItemListSchema = z.array(projectItemSchema);

type ProjectCardDeployStatus = z.infer<typeof projectCardDeployStatusSchema>;
type ProjectCategory = z.infer<typeof projectCategorySchema>;
type PreviewVariant = z.infer<typeof previewVariantSchema>;
type ProjectItem = z.infer<typeof projectItemSchema>;
type ProjectItemList = z.infer<typeof projectItemListSchema>;

const TEMPLATE_UNCONFIGURED_LABEL = '템플릿 미설정';
const TEMPLATE_UNCONFIGURED_SUBTITLE = '홈에서 템플릿을 골라 주세요';
const TEMPLATE_UNCONFIGURED_HINT = '빈 템플릿';

const DEPLOY_STATUS_LABEL: Record<ProjectCardDeployStatus, string> = {
  pending: '배포 전',
  deploying: '배포 중',
  deployed: '배포 완료',
};

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  landing: '랜딩 페이지',
  portfolio: '포트폴리오 페이지',
  business: '비즈니스 페이지',
};

export {
  projectCardDeployStatusSchema,
  projectCategorySchema,
  previewVariantSchema,
  projectItemSchema,
  projectItemListSchema,
  TEMPLATE_UNCONFIGURED_LABEL,
  TEMPLATE_UNCONFIGURED_SUBTITLE,
  TEMPLATE_UNCONFIGURED_HINT,
  DEPLOY_STATUS_LABEL,
  CATEGORY_LABEL,
  type ProjectCardDeployStatus,
  type ProjectCategory,
  type PreviewVariant,
  type ProjectItem,
  type ProjectItemList,
};
