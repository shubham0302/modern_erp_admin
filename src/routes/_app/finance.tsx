import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";

export const Route = createFileRoute("/_app/finance")({
  component: () => (
    <ComingSoon
      title="Finance"
      description="Invoices, payments, GST and accounting overview."
    />
  ),
});
