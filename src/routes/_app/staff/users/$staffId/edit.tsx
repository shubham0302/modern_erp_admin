import { createFileRoute } from "@tanstack/react-router";
import StaffEditPage from "@/features/staff/StaffEditPage";

export const Route = createFileRoute("/_app/staff/users/$staffId/edit")({
  component: StaffEditPage,
});
