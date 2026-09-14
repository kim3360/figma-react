import { createFileRoute } from '@tanstack/react-router';
import MonoformTemplatePage from '@/components/templates/monoform/MonoformTemplatePage';

export const Route = createFileRoute('/template/monoform')({
  component: MonoformTemplatePage,
  head: () => ({ meta: [{ title: 'MONOFORM — 독립 크리에이티브 스튜디오' }] }),
});
