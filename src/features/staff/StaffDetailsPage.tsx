import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { getRole, getStaff } from "./api";
import ModulePermissionsView from "./ModulePermissionsView";
import type { Permission, Role, Staff } from "./types";
import type { ApiError } from "@/lib/api/types";

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const StaffDetailsPage: React.FC = () => {
  const { staffId } = useParams({ from: "/_app/staff/users/$staffId" });

  const [staff, setStaff] = useState<Staff | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setRole(null);
    setPermissions([]);
    getStaff(staffId)
      .then(async (s) => {
        if (cancelled) return;
        setStaff(s);
        if (s.roleId) {
          setRoleLoading(true);
          try {
            const detail = await getRole(s.roleId);
            if (cancelled) return;
            setRole(detail.role);
            setPermissions(detail.permissions);
          } catch (err) {
            if (cancelled) return;
            const message =
              (axios.isAxiosError(err) &&
                (err.response?.data as ApiError | undefined)?.error?.message) ||
              "Failed to load role details";
            toast.error(message);
          } finally {
            if (!cancelled) setRoleLoading(false);
          }
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          (axios.isAxiosError(err) &&
            (err.response?.data as ApiError | undefined)?.error?.message) ||
          "Failed to load staff";
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [staffId]);

  if (loading || !staff) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-2xl space-y-6">
      <div className="overflow-hidden rounded-3xl border border-nl-100 bg-white">
        <div className="flex items-start justify-between gap-3 px-6 py-6 sm:px-8">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-nl-900">
              {staff.name}
            </h2>
            <p className="mt-1 text-sm text-nl-500">{staff.email}</p>
          </div>
          <Link
            to="/staff/users/$staffId/edit"
            params={{ staffId }}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 text-xs font-medium text-nl-700 shadow-xs ring-1 ring-nl-200 transition-colors hover:bg-nl-50 hover:text-nl-900"
          >
            <Pencil size={13} />
            Edit
          </Link>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-nl-100 px-6 py-6 sm:grid-cols-2 sm:px-8">
          <DetailRow label="Phone" value={staff.phone} />
          <DetailRow
            label="Status"
            value={
              <span
                className={
                  staff.isActive
                    ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                    : "inline-flex items-center gap-1.5 rounded-full bg-nl-100 px-2.5 py-0.5 text-xs font-medium text-nl-600"
                }
              >
                <span
                  className={
                    staff.isActive
                      ? "size-1.5 rounded-full bg-emerald-500"
                      : "size-1.5 rounded-full bg-nl-400"
                  }
                />
                {staff.isActive ? "Active" : "Inactive"}
              </span>
            }
          />
          <DetailRow
            label="Role"
            value={
              roleLoading
                ? "Loading…"
                : role?.name ?? (
                    <span className="text-nl-400">No role assigned</span>
                  )
            }
          />
          <DetailRow label="Created" value={formatDate(staff.createdAt)} />
        </dl>
      </div>

      <div className="overflow-hidden rounded-3xl border border-nl-100 bg-white">
        <div className="px-6 py-5 sm:px-8">
          <p className="text-sm font-semibold text-nl-800">Module access</p>
          <p className="mt-0.5 text-xs text-nl-500">
            {staff.roleId
              ? "Inherited from the assigned role."
              : "No role assigned, so no module access."}
          </p>
        </div>
        {staff.roleId && !roleLoading && (
          <div className="px-6 pb-6 sm:px-8">
            <ModulePermissionsView permissions={permissions} />
          </div>
        )}
        {staff.roleId && roleLoading && (
          <div className="flex items-center justify-center px-6 pb-8 sm:px-8">
            <div className="size-6 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <div>
    <dt className="text-[11px] font-semibold uppercase tracking-wider text-nl-500">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-nl-800">{value}</dd>
  </div>
);

export default StaffDetailsPage;
