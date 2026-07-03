import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import AppRouterEffects from '@/components/auth/AppRouterEffects';
import NotFoundPage from '@/components/layout/NotFoundPage';
import AppSidebar from '@/components/common/AppSidebar';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <NotFoundPage />,
});

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showAppChrome = pathname !== '/' && !pathname.startsWith('/template');

  return (
    <>
      <AppRouterEffects />

      {!showAppChrome ? (
        <div className="min-h-screen w-full bg-[#f8fafc] text-[#0f172a]">
          <Outlet />
        </div>
      ) : (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] text-[#0f172a]">
          <AppSidebar />
          <main id="app-main-scroll" className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            {/* <HeaderContainer /> */}
            <Outlet />
          </main>
        </div>
      )}
    </>
  );
}
