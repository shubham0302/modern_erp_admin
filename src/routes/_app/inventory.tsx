import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";

export const Route = createFileRoute("/_app/inventory")({
  component: () => (
    <ComingSoon
      title="Inventory"
      description="Warehouse stock, batches and movement history."
    />
  ),
});
