import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";

export const Route = createFileRoute("/_app/production")({
  component: () => (
    <ComingSoon
      title="Production"
      description="Production runs, batches and manufacturing schedules."
    />
  ),
});
