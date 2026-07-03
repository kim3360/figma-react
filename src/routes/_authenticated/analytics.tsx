import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/analytics')({
  component: RouteComponent,
});
function RouteComponent() {
  return <div>분석</div>;
}
