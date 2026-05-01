import { createFileRoute } from "@tanstack/react-router";
import StaffDetailsPage from "@/features/staff/StaffDetailsPage";

export const Route = createFileRoute("/_app/staff/users/$staffId/")({
  component: StaffDetailsPage,
});
