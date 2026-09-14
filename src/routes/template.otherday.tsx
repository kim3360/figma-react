import { createFileRoute } from '@tanstack/react-router';
import OtherdayTemplatePage from '@/components/templates/otherday/OtherdayTemplatePage';

export const Route = createFileRoute('/template/otherday')({
  component: OtherdayTemplatePage,
  head: () => ({ meta: [{ title: 'OTHERDAY — 좋은 하루의 시작' }] }),
});
