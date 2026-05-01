import { createFileRoute } from "@tanstack/react-router";
import StaffUsersPage from "@/features/staff/StaffUsersPage";

export const Route = createFileRoute("/_app/staff/users/")({
  component: StaffUsersPage,
});
