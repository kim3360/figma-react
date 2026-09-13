import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

export type ProjectWorkspaceTab =
  | 'overview'
  | 'approvals'
  | 'deployments'
  | 'domains'
  | 'environment'
  | 'infra';

const tabs: { id: ProjectWorkspaceTab; label: string; to: string }[] = [
  { id: 'overview', label: '개요', to: '/project/$slug' },
  { id: 'approvals', label: '승인', to: '/project/$slug/approvals' },
  { id: 'deployments', label: '배포', to: '/project/$slug/deployments' },
  { id: 'domains', label: '도메인', to: '/project/$slug/domains' },
  { id: 'environment', label: '환경변수', to: '/project/$slug/environment' },
  { id: 'infra', label: '인프라', to: '/project/$slug/infra' },
];

type ProjectWorkspaceNavProps = {
  projectId: number;
  active: ProjectWorkspaceTab;
};

function ProjectWorkspaceNav({ projectId, active }: ProjectWorkspaceNavProps) {
  const slug = String(projectId);

  return (
    <nav className="mt-5 flex flex-wrap gap-1 border-b border-[#e2e8f0] pb-px">
      {tabs.map((tab) => {
        const isActive = tab.id === active;

        return (
          <Link
            key={tab.id}
            to={tab.to}
            params={{ slug }}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-[13px] font-semibold transition',
              isActive
                ? 'border-[#7c3aed] text-[#7c3aed]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default ProjectWorkspaceNav;
