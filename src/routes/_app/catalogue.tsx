import { createFileRoute, Outlet, Navigate, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/catalogue")({
  component: CatalogueLayout,
});

function CatalogueLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/catalogue" || pathname === "/catalogue/") {
    return <Navigate to="/catalogue/sizes" replace />;
  }

  return <Outlet />;
}
