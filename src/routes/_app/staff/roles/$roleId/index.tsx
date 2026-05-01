import { createFileRoute } from "@tanstack/react-router";
import RoleDetailsPage from "@/features/staff/RoleDetailsPage";

export const Route = createFileRoute("/_app/staff/roles/$roleId/")({
  component: RoleDetailsPage,
});
