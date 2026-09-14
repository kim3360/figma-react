import { createFileRoute } from '@tanstack/react-router';
import StillhouseTemplatePage from '@/components/templates/stillhouse/StillhouseTemplatePage';

export const Route = createFileRoute('/template/stillhouse')({
  component: StillhouseTemplatePage,
  head: () => ({ meta: [{ title: 'STILLHOUSE — 공간의 고요한 가능성' }] }),
});
