import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

type ProjectNavLinkProps = {
  projectId: number;
  className?: string;
  children: ReactNode;
};

function ProjectNavLink({ projectId, className, children }: ProjectNavLinkProps) {
  return (
    <Link to="/project/$slug" params={{ slug: String(projectId) }} className={className}>
      {children}
    </Link>
  );
}

export default ProjectNavLink;
