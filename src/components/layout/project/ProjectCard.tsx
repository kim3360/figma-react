import { LayoutTemplate } from 'lucide-react';
import ProjectNavLink from '@/components/layout/project/ProjectNavLink';
import {
  CATEGORY_LABEL,
  DEPLOY_STATUS_LABEL,
  TEMPLATE_UNCONFIGURED_HINT,
  TEMPLATE_UNCONFIGURED_LABEL,
  TEMPLATE_UNCONFIGURED_SUBTITLE,
  type ProjectItem,
} from '@/types/project-card.type';
import { cn } from '@/lib/utils';

const deployBadgeClass: Record<ProjectItem['deployStatus'], string> = {
  pending: 'bg-[#fef9c3] text-[#854d0e]',
  deploying: 'bg-[#e9d5ff] text-[#c2410c]',
  deployed: 'bg-[#dcfce7] text-[#166534]',
};

const categoryBadgeClass: Record<ProjectItem['category'], string> = {
  landing: 'bg-[#dcfce7] text-[#1d4ed8]',
  portfolio: 'bg-[#f0f2f5] text-[#6d28d9]',
  business: 'bg-[#f0f2f5] text-[#7e22ce]',
};

function BrowserChrome({ slug }: { slug: string }) {
  return (
    <div className="flex h-[26px] items-center gap-2 border-b border-[#e5e7eb] bg-[#f1f5f9] px-2">
      <div className="flex gap-1">
        <span className="size-1.5 rounded-[3px] bg-[#fca5a5]" />
        <span className="size-1.5 rounded-[3px] bg-[#fcd34d]" />
        <span className="size-1.5 rounded-[3px] bg-[#86efac]" />
      </div>
      <div className="min-w-0 flex-1 rounded-[3px] border border-[#e5e7eb] bg-white px-1.5 py-1">
        <p className="truncate text-[9px] text-[#94a3b8]">{slug}</p>
      </div>
    </div>
  );
}

function UnconfiguredTemplatePreview() {
  return (
    <div className="flex min-h-[88px] flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#faf5ff] via-[#f5f3ff] to-[#ede9fe] px-3 py-5">
      <span className="flex size-9 items-center justify-center rounded-full bg-white/80 text-[#7c3aed] shadow-sm ring-1 ring-[#e9d5ff]">
        <LayoutTemplate className="size-4" strokeWidth={1.75} />
      </span>
      <p className="text-center text-[10px] font-medium leading-snug text-[#64748b] transition ">
        {TEMPLATE_UNCONFIGURED_HINT}
      </p>
    </div>
  );
}

function LandingPreview() {
  return (
    <div className="flex flex-col gap-1.5 p-2">
      <div className="h-8 w-full rounded bg-gradient-to-br from-[#fdba74] to-[#ea580c]" />
      <div className="flex flex-col gap-1">
        <div className="h-1 w-full rounded-sm bg-[#e5e7eb]" />
        <div className="h-1 w-[82%] rounded-sm bg-[#e5e7eb]" />
        <div className="h-1 w-[48%] rounded-sm bg-[#e5e7eb]" />
      </div>
      <div className="flex gap-1 pt-0.5">
        <div className="h-2.5 w-7 rounded-sm bg-[#ea580c]" />
        <div className="h-2.5 w-5 rounded-sm border border-[#cbd5e1]" />
      </div>
    </div>
  );
}

function PortfolioPreview() {
  return (
    <div className="grid min-h-[72px] grid-cols-3 grid-rows-[28px_30px] gap-1 p-2">
      <div className="col-span-3 rounded bg-gradient-to-br from-[#e9d5ff] to-[#a78bfa]" />
      <div className="rounded bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe]" />
      <div className="rounded bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe]" />
      <div className="rounded bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe]" />
    </div>
  );
}

function BusinessPreview() {
  return (
    <div className="flex gap-1.5 p-2">
      <div className="w-3.5 shrink-0 rounded bg-gradient-to-b from-[#f1f5f9] to-[#e5e7eb]" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="h-3 w-full rounded bg-gradient-to-r from-[#e7e5e4] to-[#67e8f9]" />
        <div className="grid min-h-9 flex-1 grid-cols-3 gap-1">
          <div className="rounded border border-[#e5e7eb] bg-[#f1f5f9]" />
          <div className="rounded border border-[#e5e7eb] bg-[#f1f5f9]" />
          <div className="rounded border border-[#e5e7eb] bg-[#f1f5f9]" />
        </div>
      </div>
    </div>
  );
}

function ProjectPreview({ variant }: { variant: ProjectItem['preview'] }) {
  if (variant === 'portfolio') return <PortfolioPreview />;
  if (variant === 'business') return <BusinessPreview />;
  return <LandingPreview />;
}

type ProjectCardProps = {
  project: ProjectItem;
};

function ProjectCard({ project }: ProjectCardProps) {
  const categoryLabel = project.hasTemplate
    ? CATEGORY_LABEL[project.category]
    : TEMPLATE_UNCONFIGURED_LABEL;

  const categoryClass = project.hasTemplate
    ? categoryBadgeClass[project.category]
    : 'bg-[#f1f5f9] text-[#64748b]';

  const subtitle = project.hasTemplate ? project.subtitle : TEMPLATE_UNCONFIGURED_SUBTITLE;

  return (
    <ProjectNavLink
      projectId={Number(project.id)}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-[#e5e7eb] bg-white transition',
        'hover:border-[#c4b5fd] hover:shadow-[0_8px_24px_rgba(99,102,241,0.1)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366f1]',
        !project.hasTemplate && 'hover:border-[#c4b5fd]',
      )}
    >
      <div className="border-b border-[#f1f5f9] bg-gradient-to-b from-[#f8fafc] to-white px-3 pb-3 pt-3">
        <div
          className={cn(
            'overflow-hidden rounded-md border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]',
            project.hasTemplate ? 'border-[#e5e7eb]' : 'border-[#e9d5ff]',
          )}
        >
          <BrowserChrome slug={project.slug} />
          {project.hasTemplate ? (
            <ProjectPreview variant={project.preview} />
          ) : (
            <UnconfiguredTemplatePreview />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-5 pb-4 pt-4">
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`rounded px-2 py-0.5 text-[11px] font-semibold leading-[13px] ${deployBadgeClass[project.deployStatus]}`}
          >
            {DEPLOY_STATUS_LABEL[project.deployStatus]}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-[11px] font-semibold leading-[13px] ${categoryClass}`}
          >
            {categoryLabel}
          </span>
        </div>
        <h3 className="pt-2.5 text-[15px] font-bold tracking-[-0.3px] text-[#111827]">
          {project.slug}
        </h3>
        <p className="text-[13px] leading-[19px] text-[#94a3b8]">{subtitle}</p>
      </div>

      <footer className="border-t border-[#f1f5f9] px-6 py-4 text-right">
        <time className="text-[12px] text-[#94a3b8]">{project.updatedAt}</time>
      </footer>
    </ProjectNavLink>
  );
}

export default ProjectCard;
