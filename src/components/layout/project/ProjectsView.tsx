import { useMemo, useState } from 'react';
import { FolderKanban, LayoutGrid, List, Plus, Search } from 'lucide-react';
import ProjectCard from './ProjectCard';
import ProjectNavLink from '@/components/layout/project/ProjectNavLink';
import ProjectCreateDialog from './ProjectCreateDialog';
import { FilterSelect } from '@/components/ui/Filter';
import { useProjectListQuery } from '@/api/projects';
import { formatProjectDisplayName } from '@/components/layout/project/agentChat.utils';
import { hasProjectTemplate, templateTypeToPreviewVariant } from '@/lib/projectTemplate';
import {
  DEPLOY_STATUS_LABEL,
  TEMPLATE_UNCONFIGURED_LABEL,
  TEMPLATE_UNCONFIGURED_SUBTITLE,
  type ProjectItem,
} from '@/types/project-card.type';
import type { DeployStatus } from '@/types/common.enum';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type FilterOption = 'all' | ProjectItem['deployStatus'];
type SortOption = 'lastModified' | 'name';

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '배포 전' },
  { value: 'deploying', label: '배포 중' },
  { value: 'deployed', label: '배포 완료' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'lastModified', label: '최근 수정순' },
  { value: 'name', label: '이름순' },
];

function toProjectCardItem(project: {
  projectId: number;
  name: string;
  deployStatus: DeployStatus;
  currentUrl: string | null;
  updatedAtRelativeText: string;
  templateType: string | null;
  startMode: string | null;
}): ProjectItem {
  const deployStatusMap: Record<DeployStatus, ProjectItem['deployStatus']> = {
    DRAFT: 'pending',
    PENDING: 'pending',
    IN_PROGRESS: 'deploying',
    PREVIEW_READY: 'deploying',
    LIVE: 'deployed',
    FAILED: 'pending',
  };

  const hasTemplate = hasProjectTemplate(project);

  return {
    id: String(project.projectId),
    slug: formatProjectDisplayName(project.name, project.projectId),
    deployStatus: deployStatusMap[project.deployStatus],
    category: 'landing',
    hasTemplate,
    subtitle: project.currentUrl ?? '배포되지 않음',
    updatedAt: project.updatedAtRelativeText,
    preview: hasTemplate ? templateTypeToPreviewVariant(project.templateType) : 'landing',
  };
}

function ProjectListRow({ project }: { project: ProjectItem }) {
  const subtitle = project.hasTemplate ? project.subtitle : TEMPLATE_UNCONFIGURED_SUBTITLE;

  return (
    <ProjectNavLink
      projectId={Number(project.id)}
      className="flex items-center gap-4 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 transition hover:border-[#c4b5fd] hover:shadow-[0_4px_16px_rgba(99,102,241,0.08)]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-[#111827]">{project.slug}</p>
        <p className="truncate text-[12px] text-[#94a3b8]">{subtitle}</p>
      </div>
      <span className="shrink-0 rounded bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-medium text-[#475569]">
        {DEPLOY_STATUS_LABEL[project.deployStatus]}
      </span>
      {!project.hasTemplate ? (
        <span className="shrink-0 rounded bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-medium text-[#64748b]">
          {TEMPLATE_UNCONFIGURED_LABEL}
        </span>
      ) : null}
      <time className="shrink-0 text-[12px] text-[#94a3b8]">{project.updatedAt}</time>
    </ProjectNavLink>
  );
}

function ProjectsView() {
  const { data: projects = [], isLoading } = useProjectListQuery('projects-view');
  const projectItems = projects.map(toProjectCardItem);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('lastModified');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let items = projectItems;

    if (filter !== 'all') {
      items = items.filter((project) => project.deployStatus === filter);
    }

    if (query) {
      items = items.filter(
        (project) =>
          project.slug.toLowerCase().includes(query) ||
          project.subtitle.toLowerCase().includes(query),
      );
    }

    if (sort === 'name') {
      return [...items].sort((a, b) => a.slug.localeCompare(b.slug, 'ko'));
    }

    return items;
  }, [filter, projectItems, searchQuery, sort]);

  const skeletonItems = Array.from({ length: 6 }, (_, index) => `project-skeleton-${index}`);
  const isEmpty = !isLoading && projectItems.length === 0;
  const isFilteredEmpty = !isLoading && projectItems.length > 0 && filteredProjects.length === 0;

  return (
    <section className="flex-1 overflow-y-auto bg-white px-4 pb-12 sm:px-6">
      <div className="mx-auto max-w-[1280px]">
        <header className="flex flex-col gap-4 border-b border-[#e2e8f0] py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#7c3aed]">
              <FolderKanban className="size-4" strokeWidth={2} />
              <span className="text-[11px] font-semibold tracking-[0.1em]">WORKSPACE</span>
            </div>
            <h1 className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-[#0f172a]">
              프로젝트
            </h1>
            <p className="mt-1 text-[13px] text-[#64748b]">
              아이디어를 만들고, AI와 함께 배포까지 이어가 보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateDialogOpen(true)}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#7c3aed] px-4 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.28)] transition hover:bg-[#6d28d9]"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            프로젝트 생성
          </button>
        </header>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[#0f172a]">내 프로젝트</h2>
              <p className="mt-0.5 text-[12px] text-[#94a3b8]">
                {isLoading
                  ? '프로젝트를 불러오는 중...'
                  : `${filteredProjects.length}개의 프로젝트`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-2">
            <label className="flex h-9 min-w-[210px] flex-1 items-center gap-2 rounded-lg border border-transparent bg-white px-3 text-[#94a3b8] shadow-sm  sm:max-w-[340px]">
              <Search className="size-4" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="프로젝트 이름 또는 URL 검색"
                aria-label="프로젝트 검색"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#334155] outline-none placeholder:text-[#94a3b8]"
              />
            </label>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <FilterSelect
                value={filter}
                onChange={(value) => setFilter(value as FilterOption)}
                options={FILTER_OPTIONS}
                aria-label="배포 상태 필터"
              />

              <FilterSelect
                value={sort}
                onChange={(value) => setSort(value as SortOption)}
                options={SORT_OPTIONS}
                aria-label="정렬 기준"
              />

              <div className="flex shrink-0 items-center rounded-lg border border-[#e2e8f0] bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="그리드 보기"
                  aria-pressed={viewMode === 'grid'}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md transition',
                    viewMode === 'grid'
                      ? 'bg-white text-[#0f172a] shadow-sm'
                      : 'text-[#94a3b8] hover:text-[#475569]',
                  )}
                >
                  <LayoutGrid className="size-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="목록 보기"
                  aria-pressed={viewMode === 'list'}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md transition',
                    viewMode === 'list'
                      ? 'bg-white text-[#0f172a] shadow-sm'
                      : 'text-[#94a3b8] hover:text-[#475569]',
                  )}
                >
                  <List className="size-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <ProjectCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

        {isEmpty ? (
          <div className="mt-5 flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-5 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white text-[#7c3aed] shadow-sm">
              <FolderKanban className="size-5" />
            </span>
            <h3 className="mt-4 text-[15px] font-bold text-[#0f172a]">아직 프로젝트가 없습니다</h3>
            <p className="mt-1 text-[13px] text-[#64748b]">
              새 프로젝트를 만들어 첫 아이디어를 실현해 보세요.
            </p>
          </div>
        ) : null}

        {isFilteredEmpty ? (
          <div className="mt-5 flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc]">
            <p className="text-sm text-[#94a3b8]">검색·필터 조건에 맞는 프로젝트가 없습니다.</p>
          </div>
        ) : null}

        {viewMode === 'grid' ? (
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? skeletonItems.map((key) => (
                  <div
                    key={key}
                    className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white"
                  >
                    <div className="h-[140px] animate-pulse bg-[#f1f5f9]" />
                    <div className="space-y-3 px-5 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-[#e2e8f0]" />
                      <div className="h-5 w-3/4 animate-pulse rounded bg-[#e2e8f0]" />
                      <div className="h-4 w-full animate-pulse rounded bg-[#f1f5f9]" />
                    </div>
                    <div className="border-t border-[#f1f5f9] px-6 py-4">
                      <div className="ml-auto h-3 w-16 animate-pulse rounded bg-[#e2e8f0]" />
                    </div>
                  </div>
                ))
              : isEmpty || isFilteredEmpty
                ? null
                : filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            {isLoading
              ? skeletonItems.map((key) => (
                  <div
                    key={key}
                    className="h-[52px] animate-pulse rounded-lg border border-[#e5e7eb] bg-[#f8fafc]"
                  />
                ))
              : isEmpty || isFilteredEmpty
                ? null
                : filteredProjects.map((project) => (
                    <ProjectListRow key={project.id} project={project} />
                  ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectsView;
