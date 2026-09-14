import { createFileRoute } from '@tanstack/react-router';
import SolunaTemplatePage from '@/components/templates/soluna/SolunaTemplatePage';

export const Route = createFileRoute('/template/soluna')({
  component: SolunaTemplatePage,
  head: () => ({ meta: [{ title: 'SOLUNA — 나에게 돌아오는 시간' }] }),
});
