import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/project/$slug/code')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/project/$slug/agent',
      params,
      search: { view: 'code' },
      replace: true,
    });
  },
});
