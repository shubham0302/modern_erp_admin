import { createFileRoute } from "@tanstack/react-router";
import RoleNewPage from "@/features/staff/RoleNewPage";

export const Route = createFileRoute("/_app/staff/roles/new")({
  component: RoleNewPage,
});
