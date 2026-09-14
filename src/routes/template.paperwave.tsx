import { createFileRoute } from '@tanstack/react-router';
import PaperwaveTemplatePage from '@/components/templates/paperwave/PaperwaveTemplatePage';

export const Route = createFileRoute('/template/paperwave')({
  component: PaperwaveTemplatePage,
  head: () => ({ meta: [{ title: 'PAPERWAVE — 읽는 순간, 새로운 세계' }] }),
});
