import { createFileRoute } from "@tanstack/react-router";
import DesignCodesPage from "@/features/catalogue/pages/DesignCodesPage";

export const Route = createFileRoute("/_app/catalogue/designs")({
  component: DesignCodesPage,
});
