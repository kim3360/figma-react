import { Clock3, ExternalLink, LayoutTemplate } from 'lucide-react';
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
  pending: 'border-[#fde68a] bg-[#fffbeb] text-[#a16207]',
  deploying: 'border-[#ddd6fe] bg-[#f5f3ff] text-[#6d28d9]',
  deployed: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
};

const categoryBadgeClass: Record<ProjectItem['category'], string> = {
  landing: 'bg-[#eff6ff] text-[#2563eb]',
  portfolio: 'bg-[#faf5ff] text-[#7e22ce]',
  business: 'bg-[#f0fdfa] text-[#0f766e]',
};

function BrowserChrome({ slug }: { slug: string }) {
  return (
    <div className="flex h-7 items-center gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-2.5">
      <div className="flex gap-1">
        <span className="size-1.5 rounded-full bg-[#fca5a5]" />
        <span className="size-1.5 rounded-full bg-[#fcd34d]" />
        <span className="size-1.5 rounded-full bg-[#86efac]" />
      </div>
      <div className="min-w-0 flex-1 rounded bg-white px-2 py-1 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]">
        <p className="truncate text-[8px] text-[#94a3b8]">{slug}</p>
      </div>
    </div>
  );
}

function UnconfiguredTemplatePreview() {
  return (
    <div className="flex h-[128px] flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#faf5ff] via-[#f8fafc] to-[#eef2ff]">
      <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#7c3aed] shadow-sm ring-1 ring-[#e9d5ff]">
        <LayoutTemplate className="size-4" strokeWidth={1.75} />
      </span>
      <p className="text-[10px] font-medium text-[#64748b]">{TEMPLATE_UNCONFIGURED_HINT}</p>
    </div>
  );
}

function LandingPreview() {
  return (
    <div className="h-[128px] bg-white p-3">
      <div className="flex items-center justify-between text-[7px] font-semibold text-[#334155]">
        <span className="text-[#7c3aed]">STUDIO</span>
        <span>소개 · 서비스 · 문의</span>
      </div>
      <div className="mt-3 grid grid-cols-[1.15fr_0.85fr] gap-3">
        <div>
          <div className="h-2 w-4/5 rounded bg-[#1e293b]" />
          <div className="mt-1 h-2 w-3/5 rounded bg-[#1e293b]" />
          <div className="mt-2 h-1 w-full rounded bg-[#e2e8f0]" />
          <div className="mt-1 h-1 w-4/5 rounded bg-[#e2e8f0]" />
          <div className="mt-3 h-4 w-12 rounded bg-[#7c3aed]" />
        </div>
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#ddd6fe] to-[#a78bfa]">
          <div className="absolute -bottom-3 -right-2 size-14 rounded-full bg-[#f5f3ff]/80" />
          <div className="absolute bottom-3 left-3 size-6 rounded-full border-[3px] border-white/75" />
        </div>
      </div>
    </div>
  );
}

function PortfolioPreview() {
  return (
    <div className="grid h-[128px] grid-cols-[0.82fr_1.18fr] bg-[#111827] p-3">
      <div className="flex flex-col justify-between border-r border-white/10 pr-3">
        <span className="text-[7px] font-semibold tracking-[0.16em] text-[#c4b5fd]">PORTFOLIO</span>
        <div>
          <div className="h-2 w-full rounded bg-white" />
          <div className="mt-1 h-2 w-3/4 rounded bg-white" />
        </div>
        <span className="text-[7px] text-[#94a3b8]">Creative developer</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 pl-3">
        <div className="rounded bg-[#c4b5fd]" />
        <div className="rounded bg-[#fbbf24]" />
        <div className="rounded bg-[#67e8f9]" />
        <div className="rounded bg-[#fda4af]" />
      </div>
    </div>
  );
}

function BusinessPreview() {
  return (
    <div className="h-[128px] bg-[#f8fafc] p-3">
      <div className="flex items-center justify-between text-[7px] font-bold text-[#0f172a]">
        <span>COMPANY</span>
        <span className="text-[#64748b]">ABOUT · NEWS · CONTACT</span>
      </div>
      <div className="mt-3 h-5 rounded bg-gradient-to-r from-[#0f172a] to-[#334155]" />
      <div className="mt-2 grid grid-cols-3 gap-2">
        {['w-4/5', 'w-2/3', 'w-3/4'].map((width) => (
          <div key={width} className="rounded border border-[#e2e8f0] bg-white p-2">
            <div className="h-1.5 w-1/2 rounded bg-[#cbd5e1]" />
            <div className={`mt-2 h-1 ${width} rounded bg-[#e2e8f0]`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectPreview({ variant }: { variant: ProjectItem['preview'] }) {
  if (variant === 'portfolio') return <PortfolioPreview />;
  if (variant === 'business') return <BusinessPreview />;
  return <LandingPreview />;
}

type ProjectCardProps = { project: ProjectItem };

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
        'group flex min-h-[276px] flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white transition duration-200',
        'hover:-translate-y-0.5 hover:border-[#c4b5fd] hover:shadow-[0_12px_28px_rgba(71,55,132,0.12)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]',
      )}
    >
      <div className="border-b border-[#f1f5f9] bg-[#f8fafc] p-3">
        <div className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
          <BrowserChrome slug={project.slug} />
          {project.hasTemplate ? (
            <ProjectPreview variant={project.preview} />
          ) : (
            <UnconfiguredTemplatePreview />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${deployBadgeClass[project.deployStatus]}`}
          >
            {DEPLOY_STATUS_LABEL[project.deployStatus]}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryClass}`}>
            {categoryLabel}
          </span>
        </div>
        <h3 className="mt-3 truncate text-[15px] font-bold tracking-[-0.02em] text-[#0f172a]">
          {project.slug}
        </h3>
        <p className="mt-1 truncate text-[12px] text-[#64748b]">{subtitle}</p>
      </div>

      <footer className="flex items-center justify-between border-t border-[#f1f5f9] px-5 py-3">
        <time className="flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
          <Clock3 className="size-3.5" />
          {project.updatedAt}
        </time>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#7c3aed] opacity-0 transition group-hover:opacity-100">
          열기 <ExternalLink className="size-3" />
        </span>
      </footer>
    </ProjectNavLink>
  );
}

export default ProjectCard;
