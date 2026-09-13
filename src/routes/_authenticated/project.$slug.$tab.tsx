import { createFileRoute, redirect } from '@tanstack/react-router';

const RESERVED_SLUG_CHILDREN = new Set(['agent', 'code', 'pipeline']);

const TAB_REDIRECTS = {
  approvals: '/project/$slug/approvals',
  deployments: '/project/$slug/deployments',
  domains: '/project/$slug/domains',
  environment: '/project/$slug/environment',
  infra: '/project/$slug/infra',
} as const;

export const Route = createFileRoute('/_authenticated/project/$slug/$tab')({
  beforeLoad: ({ params }) => {
    if (RESERVED_SLUG_CHILDREN.has(params.tab)) {
      return;
    }

    const target = TAB_REDIRECTS[params.tab as keyof typeof TAB_REDIRECTS];
    if (target) {
      throw redirect({
        to: target,
        params: { slug: params.slug },
        replace: true,
      });
    }

    throw redirect({
      to: '/project/$slug',
      params: { slug: params.slug },
      replace: true,
    });
  },
  component: () => null,
});
