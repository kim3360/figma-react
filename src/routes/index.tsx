import { createFileRoute } from '@tanstack/react-router';
import MainContainer from '@/components/layout/main/MainContainer';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <MainContainer />;
}
