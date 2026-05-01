import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/staff")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/staff" || location.pathname === "/staff/") {
      throw redirect({ to: "/staff/users" });
    }
  },
  component: () => <Outlet />,
});
