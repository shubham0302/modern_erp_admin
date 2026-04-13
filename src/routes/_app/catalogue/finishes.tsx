import { createFileRoute } from "@tanstack/react-router";
import FinishesPage from "@/features/catalogue/pages/FinishesPage";

export const Route = createFileRoute("/_app/catalogue/finishes")({
  component: FinishesPage,
});
