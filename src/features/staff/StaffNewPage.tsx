import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";
import StaffForm, { type StaffFormValues } from "./StaffForm";
import { createStaff } from "./api";
import type { ApiError } from "@/lib/api/types";

const StaffNewPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values: StaffFormValues) => {
    try {
      await createStaff({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        roleId: values.roleId,
      });
      toast.success("Staff created successfully");
      navigate({ to: "/staff/users" });
    } catch (err) {
      const message =
        (axios.isAxiosError(err) &&
          (err.response?.data as ApiError | undefined)?.error?.message) ||
        "Failed to create staff";
      toast.error(message);
      throw err;
    }
  };

  return (
    <div className="page-enter mx-auto max-w-2xl">
      <StaffForm
        passwordRequired
        submitLabel="Create Staff"
        submittingLabel="Creating…"
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: "/staff/users" })}
      />
    </div>
  );
};

export default StaffNewPage;
