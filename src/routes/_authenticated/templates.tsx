import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/templates')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>템플릿</div>;
}
