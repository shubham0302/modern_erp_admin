import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";
import RoleForm, { type RoleFormValues } from "./RoleForm";
import { getRole, updateRole } from "./api";
import type { Permission, Role } from "./types";
import type { ApiError } from "@/lib/api/types";

const RoleEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { roleId } = useParams({ from: "/_app/staff/roles/$roleId" });

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRole(roleId)
      .then((res) => {
        if (cancelled) return;
        setRole(res.role);
        setPermissions(res.permissions);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          (axios.isAxiosError(err) &&
            (err.response?.data as ApiError | undefined)?.error?.message) ||
          "Failed to load role";
        toast.error(message);
        navigate({ to: "/staff/roles" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roleId, navigate]);

  const handleSubmit = async (values: RoleFormValues) => {
    try {
      await updateRole(roleId, values);
      toast.success("Role updated");
      navigate({ to: "/staff/roles" });
    } catch (err) {
      const message =
        (axios.isAxiosError(err) &&
          (err.response?.data as ApiError | undefined)?.error?.message) ||
        "Failed to update role";
      toast.error(message);
      throw err;
    }
  };

  if (loading || !role) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-2xl">
      <RoleForm
        initialName={role.name}
        initialDescription={role.description}
        initialPermissions={permissions}
        submitLabel="Save Changes"
        submittingLabel="Saving…"
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: "/staff/roles" })}
      />
    </div>
  );
};

export default RoleEditPage;
