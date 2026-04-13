import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";

export const Route = createFileRoute("/_app/settings")({
  component: () => (
    <ComingSoon
      title="Settings"
      description="Organisation profile, users, roles and billing."
    />
  ),
});
