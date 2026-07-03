import { Outlet } from '@tanstack/react-router';
import AppSidebar from '@/components/common/AppSidebar';

export default function AppShell() {
  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc] text-[#0f172a]">
      <AppSidebar />
      <Outlet />
    </div>
  );
}
