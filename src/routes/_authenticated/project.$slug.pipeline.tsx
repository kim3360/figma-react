import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/project/$slug/pipeline')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/project/$slug/agent',
      params,
      search: { view: 'pipeline' },
      replace: true,
    });
  },
});
