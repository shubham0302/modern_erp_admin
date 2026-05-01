import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginPage from "@/features/auth/LoginPage";
import { getAccessToken } from "@/features/auth/storage";

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (input: Record<string, unknown>): LoginSearch => ({
    redirect:
      typeof input.redirect === "string" ? input.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (getAccessToken()) {
      throw redirect({ to: search.redirect ?? "/dashboard" });
    }
  },
  component: LoginPage,
});
