import {
  createRootRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  component: Root,
  beforeLoad: ({ location }) => {
    if (location.pathname === "" || location.pathname === "/") {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function Root() {
  return <Outlet />;
}
