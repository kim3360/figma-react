import { createFileRoute } from '@tanstack/react-router';
import MeSettingsPage from '@/components/layout/me/MeSettingsPage';

export const Route = createFileRoute('/_authenticated/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return <MeSettingsPage />;
}
