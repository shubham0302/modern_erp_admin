import { createFileRoute } from "@tanstack/react-router";
import RoleEditPage from "@/features/staff/RoleEditPage";

export const Route = createFileRoute("/_app/staff/roles/$roleId/edit")({
  component: RoleEditPage,
});
