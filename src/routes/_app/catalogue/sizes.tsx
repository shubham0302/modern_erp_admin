import { createFileRoute } from "@tanstack/react-router";
import TileSizesPage from "@/features/catalogue/pages/TileSizesPage";

export const Route = createFileRoute("/_app/catalogue/sizes")({
  component: TileSizesPage,
});
