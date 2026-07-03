import { createFileRoute } from '@tanstack/react-router';
import TrashPage from '@/components/layout/trash/TrashPage';

export const Route = createFileRoute('/_authenticated/trash')({
  component: TrashPage,
});
