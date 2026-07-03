import {
  projectItemListSchema,
  type ProjectCategory,
  type ProjectItem,
  type PreviewVariant,
} from '@/types/project-card.type';

export type ProjectStartType = 'landing' | 'portfolio' | 'blank';

const STORAGE_KEY = 'userProjects';

function readUserProjects(): ProjectItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = projectItemListSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function writeUserProjects(projects: ProjectItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event('user-projects-updated'));
}

function toSlug(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '');
  return base || `project-${Date.now().toString(36)}`;
}

function uniqueSlug(name: string): string {
  const existing = new Set(getAllProjects().map((p) => p.slug));
  const slug = toSlug(name);
  if (!existing.has(slug)) return slug;
  return `${slug}-${Date.now().toString(36)}`;
}

function formatUpdatedAt(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function startTypeToCategory(type: ProjectStartType): ProjectCategory {
  if (type === 'portfolio') return 'portfolio';
  return 'landing';
}

function startTypeToPreview(type: ProjectStartType): PreviewVariant {
  if (type === 'portfolio') return 'portfolio';
  return 'landing';
}

export function getAllProjects(): ProjectItem[] {
  return [...readUserProjects()];
}

export function getProjectBySlug(slug: string): ProjectItem | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

export function createUserProject(input: {
  name: string;
  description?: string;
  startType: ProjectStartType;
}): ProjectItem {
  const category = startTypeToCategory(input.startType);
  const preview = startTypeToPreview(input.startType);
  const slug = uniqueSlug(input.name);
  const subtitle =
    input.description?.trim() ||
    (input.startType === 'blank' ? 'AI 초안 준비 중' : '배포되지 않음');

  const project: ProjectItem = {
    id: crypto.randomUUID(),
    slug,
    deployStatus: 'pending',
    category,
    hasTemplate: input.startType !== 'blank',
    subtitle,
    updatedAt: formatUpdatedAt(new Date()),
    preview,
  };

  writeUserProjects([project, ...readUserProjects()]);
  return project;
}

export const START_TYPE_LABEL: Record<ProjectStartType, string> = {
  landing: '랜딩페이지',
  portfolio: '포트폴리오',
  blank: '빈 페이지',
};

export const START_TYPE_DESCRIPTION: Record<ProjectStartType, string> = {
  landing: '제품·서비스 소개에 맞춘 한 페이지',
  portfolio: '작업물과 경력을 보여주는 사이트',
  blank: 'AI 프롬프트로 처음부터 구성',
};
