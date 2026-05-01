import { createFileRoute } from "@tanstack/react-router";
import RolesPage from "@/features/staff/RolesPage";

export const Route = createFileRoute("/_app/staff/roles/")({
  component: RolesPage,
});
