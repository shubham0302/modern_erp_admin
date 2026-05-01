import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, Pencil, Plus, UserSquare2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { listRoles, listStaff } from "./api";
import type { Role, Staff } from "./types";
import type { ApiError } from "@/lib/api/types";

const ADD_BUTTON_CLASS =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-pl-500 px-3 text-sm font-semibold text-white shadow-sm shadow-pl-500/20 transition-colors hover:bg-pl-600";

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

const StaffUsersPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([listStaff(), listRoles()])
      .then(([staffRes, rolesRes]) => {
        if (cancelled) return;
        setStaff(staffRes.data);
        setRoles(rolesRes.data);
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
  }, []);

  const roleNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of roles) map.set(r.id, r.name);
    return map;
  }, [roles]);

  return (
    <div className="page-enter space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-nl-500">
          {loading ? "Loading…" : `${staff.length} staff member${staff.length === 1 ? "" : "s"}`}
        </p>
        <Link to="/staff/users/new" className={ADD_BUTTON_CLASS}>
          <Plus size={15} />
          Add Staff
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-7 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
          </div>
        ) : staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-nl-100 text-nl-400">
              <UserSquare2 size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-nl-700">No staff yet</p>
              <p className="mt-1 text-xs text-nl-500">
                Add your first staff member to get started.
              </p>
            </div>
            <Link
              to="/staff/users/new"
              className={`${ADD_BUTTON_CLASS} mt-1`}
            >
              <Plus size={15} />
              Add Staff
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-nl-100 bg-nl-50/60 text-left text-xs font-semibold uppercase tracking-wider text-nl-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-nl-50 last:border-0 hover:bg-nl-50/40"
                  >
                    <td className="px-5 py-3 font-medium text-nl-800">
                      {s.name}
                    </td>
                    <td className="px-5 py-3 text-nl-700">{s.email}</td>
                    <td className="px-5 py-3 text-nl-700">{s.phone}</td>
                    <td className="px-5 py-3 text-nl-700">
                      {roleNameById.get(s.roleId) ?? (
                        <span className="text-nl-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          s.isActive
                            ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                            : "inline-flex items-center gap-1.5 rounded-full bg-nl-100 px-2.5 py-0.5 text-xs font-medium text-nl-600"
                        }
                      >
                        <span
                          className={
                            s.isActive
                              ? "size-1.5 rounded-full bg-emerald-500"
                              : "size-1.5 rounded-full bg-nl-400"
                          }
                        />
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-nl-500">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to="/staff/users/$staffId"
                          params={{ staffId: s.id }}
                          aria-label={`View ${s.name}`}
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-nl-500 transition-colors hover:bg-nl-100 hover:text-nl-800"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          to="/staff/users/$staffId/edit"
                          params={{ staffId: s.id }}
                          aria-label={`Edit ${s.name}`}
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-nl-500 transition-colors hover:bg-nl-100 hover:text-nl-800"
                        >
                          <Pencil size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffUsersPage;
