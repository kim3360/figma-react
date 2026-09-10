import { createFileRoute } from '@tanstack/react-router';
import CrimsonTemplatePage from '@/components/templates/crimson/CrimsonTemplatePage';

export const Route = createFileRoute('/template/crimson')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: '크림슨트래블 - 국내 맞춤여행' }],
  }),
});

function RouteComponent() {
  return <CrimsonTemplatePage />;
}
