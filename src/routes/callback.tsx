import { createFileRoute, redirect } from '@tanstack/react-router';

type CallbackSearch = {
  code: string;
  state: string;
};

/** 백엔드/GitHub OAuth redirect_uri가 /callback 인 경우 /auth/callback 으로 넘김 */
export const Route = createFileRoute('/callback')({
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    code: typeof search.code === 'string' ? search.code : '',
    state: typeof search.state === 'string' ? search.state : '',
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/auth/callback',
      search,
      replace: true,
    });
  },
});
