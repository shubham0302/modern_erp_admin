import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, Pencil, Plus, ShieldCheck } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { listRoles } from "./api";
import type { Role } from "./types";
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

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listRoles()
      .then((res) => {
        if (cancelled) return;
        setRoles(res.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          (axios.isAxiosError(err) &&
            (err.response?.data as ApiError | undefined)?.error?.message) ||
          "Failed to load roles";
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-enter space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-nl-500">
          {loading
            ? "Loading…"
            : `${roles.length} role${roles.length === 1 ? "" : "s"}`}
        </p>
        <Link to="/staff/roles/new" className={ADD_BUTTON_CLASS}>
          <Plus size={15} />
          Create Role
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-7 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-nl-100 text-nl-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-nl-700">No roles yet</p>
              <p className="mt-1 text-xs text-nl-500">
                Create a role and assign module permissions.
              </p>
            </div>
            <Link to="/staff/roles/new" className={`${ADD_BUTTON_CLASS} mt-1`}>
              <Plus size={15} />
              Create Role
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-nl-100 bg-nl-50/60 text-left text-xs font-semibold uppercase tracking-wider text-nl-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-nl-50 last:border-0 hover:bg-nl-50/40"
                  >
                    <td className="px-5 py-3 font-medium text-nl-800">
                      {r.name}
                    </td>
                    <td className="px-5 py-3 text-nl-600">
                      {r.description || (
                        <span className="text-nl-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-nl-500">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to="/staff/roles/$roleId"
                          params={{ roleId: r.id }}
                          aria-label={`View ${r.name}`}
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-nl-500 transition-colors hover:bg-nl-100 hover:text-nl-800"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          to="/staff/roles/$roleId/edit"
                          params={{ roleId: r.id }}
                          aria-label={`Edit ${r.name}`}
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

export default RolesPage;
