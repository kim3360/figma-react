import { createFileRoute } from '@tanstack/react-router';
import AxiomTemplatePage from '@/components/templates/axiom/AxiomTemplatePage';

export const Route = createFileRoute('/template/axiom')({
  component: AxiomTemplatePage,
  head: () => ({ meta: [{ title: 'AXIOM — 데이터가 답이 되는 순간' }] }),
});
