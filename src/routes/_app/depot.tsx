import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";

export const Route = createFileRoute("/_app/depot")({
  component: () => (
    <ComingSoon
      title="Depot"
      description="Warehouses, depots and inter-depot transfers."
    />
  ),
});
