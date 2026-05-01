import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";

export const Route = createFileRoute("/_app/order")({
  component: () => (
    <ComingSoon
      title="Order"
      description="Track, fulfil and refund customer orders from a single place."
    />
  ),
});
