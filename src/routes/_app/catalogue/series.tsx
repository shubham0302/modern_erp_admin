import { createFileRoute } from "@tanstack/react-router";
import SeriesPage from "@/features/catalogue/pages/SeriesPage";

export const Route = createFileRoute("/_app/catalogue/series")({
  component: SeriesPage,
});
