import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";

export const Route = createFileRoute("/_app/orders")({
  component: () => (
    <ComingSoon
      title="Orders"
      description="Track, fulfil and refund customer orders from a single place."
    />
  ),
});
