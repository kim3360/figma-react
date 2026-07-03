import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { isHomeChatProject } from '@/components/layout/project/agentChat.utils';

type ProjectNavLinkProps = {
  projectId: number;
  className?: string;
  children: ReactNode;
};

function ProjectNavLink({ projectId, className, children }: ProjectNavLinkProps) {
  if (isHomeChatProject(projectId)) {
    return (
      <Link
        to="/project/$slug"
        params={{ slug: String(projectId) }}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link to="/home" className={className}>
      {children}
    </Link>
  );
}

export default ProjectNavLink;
