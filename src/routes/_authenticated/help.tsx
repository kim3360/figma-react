import { createFileRoute } from '@tanstack/react-router';
import HelpPage from '@/components/layout/help/HelpPage';

export const Route = createFileRoute('/_authenticated/help')({
  component: HelpPage,
});
