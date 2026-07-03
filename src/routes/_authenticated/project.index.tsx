import { createFileRoute } from '@tanstack/react-router';
import ProjectPage from '@/components/layout/project/ProjectPage';

export const Route = createFileRoute('/_authenticated/project/')({
  component: ProjectPage,
});
