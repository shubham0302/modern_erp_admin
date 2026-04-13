import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";

export const Route = createFileRoute("/_app/reports")({
  component: () => (
    <ComingSoon
      title="Reports"
      description="Sales, GST, stock valuation and custom exports."
    />
  ),
});
