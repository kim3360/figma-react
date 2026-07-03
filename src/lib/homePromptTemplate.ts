import type { HomeTemplateItem } from '@/mocks/home/homeTemplates';
import type { ProjectStartType } from '@/lib/userProjects';

export type HomePromptAttachedTemplate = {
  id: string;
  title: string;
  image: string;
  subtitle: string;
  startType: ProjectStartType;
};

const HOME_PROMPT_TEMPLATE_KEY = 'dvely:home-prompt-template';

function templateSubtitle(template: HomeTemplateItem): string {
  if (template.startType === 'portfolio') return '포트폴리오 템플릿';
  if (template.startType === 'blank') return '빈 페이지 템플릿';
  return '웹사이트 템플릿';
}

export function toHomePromptAttachedTemplate(
  template: HomeTemplateItem,
): HomePromptAttachedTemplate {
  return {
    id: template.id,
    title: template.title,
    image: template.image,
    subtitle: templateSubtitle(template),
    startType: template.startType,
  };
}

export function setHomePromptTemplate(template: HomePromptAttachedTemplate) {
  sessionStorage.setItem(HOME_PROMPT_TEMPLATE_KEY, JSON.stringify(template));
}

export function readHomePromptTemplate(): HomePromptAttachedTemplate | null {
  try {
    const raw = sessionStorage.getItem(HOME_PROMPT_TEMPLATE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const record = parsed as Partial<HomePromptAttachedTemplate>;
    if (
      typeof record.id !== 'string' ||
      typeof record.title !== 'string' ||
      typeof record.image !== 'string' ||
      typeof record.subtitle !== 'string' ||
      typeof record.startType !== 'string'
    ) {
      return null;
    }

    return record as HomePromptAttachedTemplate;
  } catch {
    return null;
  }
}

export function clearHomePromptTemplate() {
  sessionStorage.removeItem(HOME_PROMPT_TEMPLATE_KEY);
}
