import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";
import RoleForm, { type RoleFormValues } from "./RoleForm";
import { createRole } from "./api";
import type { ApiError } from "@/lib/api/types";

const RoleNewPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values: RoleFormValues) => {
    try {
      await createRole(values);
      toast.success("Role created");
      navigate({ to: "/staff/roles" });
    } catch (err) {
      const message =
        (axios.isAxiosError(err) &&
          (err.response?.data as ApiError | undefined)?.error?.message) ||
        "Failed to create role";
      toast.error(message);
      throw err;
    }
  };

  return (
    <div className="page-enter mx-auto max-w-2xl">
      <RoleForm
        submitLabel="Create Role"
        submittingLabel="Creating…"
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: "/staff/roles" })}
      />
    </div>
  );
};

export default RoleNewPage;
