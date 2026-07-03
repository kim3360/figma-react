import ProjectsView from '@/components/layout/project/ProjectsView';
import AppHeader from '@/components/common/AppHeader';

function ProjectPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <AppHeader />
      <ProjectsView />
    </div>
  );
}

export default ProjectPage;
