import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";
import StaffForm, { type StaffFormValues } from "./StaffForm";
import { getStaff, updateStaff } from "./api";
import type { Staff } from "./types";
import type { ApiError } from "@/lib/api/types";

const StaffEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { staffId } = useParams({ from: "/_app/staff/users/$staffId" });

  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStaff(staffId)
      .then((res) => {
        if (cancelled) return;
        setStaff(res);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          (axios.isAxiosError(err) &&
            (err.response?.data as ApiError | undefined)?.error?.message) ||
          "Failed to load staff";
        toast.error(message);
        navigate({ to: "/staff/users" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [staffId, navigate]);

  const handleSubmit = async (values: StaffFormValues) => {
    try {
      await updateStaff(staffId, {
        name: values.name,
        email: values.email,
        phone: values.phone,
        roleId: values.roleId,
        // Only send password if the admin actually entered a new one.
        ...(values.password ? { password: values.password } : {}),
      });
      toast.success("Staff updated");
      navigate({ to: "/staff/users" });
    } catch (err) {
      const message =
        (axios.isAxiosError(err) &&
          (err.response?.data as ApiError | undefined)?.error?.message) ||
        "Failed to update staff";
      toast.error(message);
      throw err;
    }
  };

  if (loading || !staff) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-2xl">
      <StaffForm
        initialName={staff.name}
        initialEmail={staff.email}
        initialPhone={staff.phone}
        initialRoleId={staff.roleId}
        passwordRequired={false}
        passwordHint="Leave empty to keep the current password."
        submitLabel="Save Changes"
        submittingLabel="Saving…"
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: "/staff/users" })}
      />
    </div>
  );
};

export default StaffEditPage;
