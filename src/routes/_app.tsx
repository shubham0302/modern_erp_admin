import { createFileRoute, Outlet } from "@tanstack/react-router";
import AdminHeader from "@/components/layout/AdminHeader";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex h-dvh w-dvw flex-col bg-nl-50">
      <AdminHeader />
      <main className="min-h-0 flex-1 overflow-auto">
        <div className="w-full px-4 pb-6 sm:px-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
