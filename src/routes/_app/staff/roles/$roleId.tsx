import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/staff/roles/$roleId")({
  component: () => <Outlet />,
});
