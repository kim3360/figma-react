import type { ProjectStartType } from '@/lib/userProjects';
import container1 from '@/assets/images/tasktemplate/container1.png';
import container2 from '@/assets/images/tasktemplate/container2.png';
import container3 from '@/assets/images/tasktemplate/container3.png';
import container4 from '@/assets/images/tasktemplate/container4.png';
import container5 from '@/assets/images/tasktemplate/container5.png';
import container6 from '@/assets/images/tasktemplate/container6.png';
import container7 from '@/assets/images/tasktemplate/container7.png';

export type HomeTemplateCategory = 'service' | 'church' | 'academy' | 'company' | 'politics';

export type HomeTemplateItem = {
  id: string;
  title: string;
  tags: string[];
  image: string;
  startType: ProjectStartType;
  category: HomeTemplateCategory;
  previewUrl?: string;
};

const DEFAULT_LANDING_PREVIEW_URL =
  'https://aih-b-image-service.cafe24.com/templates/professional/crimson/';

export function resolveHomeTemplatePreviewUrl(template: HomeTemplateItem): string {
  if (template.previewUrl) return template.previewUrl;
  if (template.startType === 'portfolio') return '/template/portfolio';
  return DEFAULT_LANDING_PREVIEW_URL;
}

export const homeTemplates: HomeTemplateItem[] = [
  {
    id: '1',
    title: '압구정 현대',
    tags: ['#빌라', '#풀빌라'],
    image: container2,
    startType: 'landing',
    category: 'service',
    previewUrl: 'https://apgujeong-h.co.kr/main/index',
  },
  {
    id: '2',
    title: '개발자 포트폴리오',
    tags: ['#포트폴리오', '#개발자'],
    image: container1,
    startType: 'landing',
    category: 'service',
  },
  {
    id: '3',
    title: 'Crimson',
    tags: ['#랜딩페이지', '#애니메이션'],
    image: container3,
    startType: 'landing',
    category: 'academy',
  },
  {
    id: '4',
    title: '비트팩토리 아카데미',
    tags: ['#음악학원', '#사이트브랜딩'],
    image: container4,
    startType: 'landing',
    category: 'academy',
  },
  {
    id: '5',
    title: '블랑뷰티살롱',
    tags: ['#뷰티', '#헤어샵'],
    image: container5,
    startType: 'landing',
    category: 'service',
  },
  {
    id: '6',
    title: '박도안 단체장',
    tags: ['#인사말', '#활동뉴스'],
    image: container6,
    startType: 'landing',
    category: 'politics',
  },
  {
    id: '7',
    title: '새물교회',
    tags: ['#교회', '#사역소개'],
    image: container7,
    startType: 'landing',
    category: 'church',
  },
];

export const DEFAULT_TEMPLATE_ID = '2';

export function getHomeTemplateById(templateId: string): HomeTemplateItem | undefined {
  return homeTemplates.find((t) => t.id === templateId);
}
