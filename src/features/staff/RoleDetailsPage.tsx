import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { getRole } from "./api";
import ModulePermissionsView from "./ModulePermissionsView";
import type { Permission, Role } from "./types";
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

const RoleDetailsPage: React.FC = () => {
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
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roleId]);

  if (loading || !role) {
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
              {role.name}
            </h2>
            <p className="mt-1 text-sm text-nl-500">
              {role.description || (
                <span className="text-nl-400">No description provided.</span>
              )}
            </p>
          </div>
          <Link
            to="/staff/roles/$roleId/edit"
            params={{ roleId }}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 text-xs font-medium text-nl-700 shadow-xs ring-1 ring-nl-200 transition-colors hover:bg-nl-50 hover:text-nl-900"
          >
            <Pencil size={13} />
            Edit
          </Link>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-nl-100 px-6 py-6 sm:grid-cols-2 sm:px-8">
          <DetailRow label="Created" value={formatDate(role.createdAt)} />
          <DetailRow label="Updated" value={formatDate(role.updatedAt)} />
        </dl>
      </div>

      <div className="overflow-hidden rounded-3xl border border-nl-100 bg-white">
        <div className="px-6 py-5 sm:px-8">
          <p className="text-sm font-semibold text-nl-800">Module access</p>
          <p className="mt-0.5 text-xs text-nl-500">
            Modules this role can read or write.
          </p>
        </div>
        <div className="px-6 pb-6 sm:px-8">
          <ModulePermissionsView permissions={permissions} />
        </div>
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

export default RoleDetailsPage;
