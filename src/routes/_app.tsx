import { useEffect } from "react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AdminHeader from "@/components/layout/AdminHeader";
import { fetchProfile } from "@/features/auth/api";
import { getAccessToken } from "@/features/auth/storage";
import { useAuthStore } from "@/features/auth/store";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    if (!getAccessToken()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    // Read & mutate the store directly so re-renders triggered by
    // setStatus do NOT cancel the in-flight profile fetch.
    const store = useAuthStore.getState();
    if (store.status !== "idle") return;
    store.setStatus("loading");
    fetchProfile()
      .then((admin) => {
        useAuthStore.getState().setAuth(admin);
      })
      .catch(() => {
        // 401s are handled by the response interceptor (refresh + retry,
        // or forceLogout). Anything else (network/5xx) — surface as a
        // forced logout so the user is not stuck on the spinner.
        useAuthStore.getState().clear();
        window.location.assign("/login");
      });
  }, []);

  if (status !== "authenticated") {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center bg-nl-50">
        <div className="size-10 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-dvw flex-col bg-nl-50">
      <AdminHeader />
      <main className="min-h-0 flex-1 overflow-auto">
        <div className="w-full px-4 pb-6 sm:px-6 md:px-10 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
