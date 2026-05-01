import { createFileRoute } from "@tanstack/react-router";
import StaffNewPage from "@/features/staff/StaffNewPage";

export const Route = createFileRoute("/_app/staff/users/new")({
  component: StaffNewPage,
});
