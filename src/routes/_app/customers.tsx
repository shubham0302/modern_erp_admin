import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";

export const Route = createFileRoute("/_app/customers")({
  component: () => (
    <ComingSoon
      title="Customers"
      description="B2B and B2C customer directory with credit profiles."
    />
  ),
});
