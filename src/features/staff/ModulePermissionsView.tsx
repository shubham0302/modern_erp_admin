import {
  Boxes,
  Eye,
  Factory,
  LayoutDashboard,
  Palette,
  Pencil,
  ShoppingCart,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  PERMISSION_MODULES,
  PERMISSION_MODULE_LABELS,
  type Permission,
  type PermissionModule,
} from "./types";

const MODULE_ICON: Record<PermissionModule, LucideIcon> = {
  dashboard: LayoutDashboard,
  designs: Palette,
  inventory: Boxes,
  production: Factory,
  order: ShoppingCart,
  finance: Wallet,
};

interface ModulePermissionsViewProps {
  permissions: Permission[];
}

const ModulePermissionsView: React.FC<ModulePermissionsViewProps> = ({
  permissions,
}) => {
  const byModule = new Map<PermissionModule, Permission>(
    permissions.map((p) => [p.module, p]),
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-nl-100 bg-nl-50/40">
      <ul className="divide-y divide-nl-100">
        {PERMISSION_MODULES.map((m) => {
          const Icon = MODULE_ICON[m];
          const p = byModule.get(m);
          const canRead = p?.canRead ?? false;
          const canWrite = p?.canWrite ?? false;
          return (
            <li
              key={m}
              className="flex items-center justify-between gap-3 bg-white/60 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    canRead || canWrite
                      ? "bg-pl-50 text-pl-600"
                      : "bg-nl-100 text-nl-400",
                  )}
                >
                  <Icon size={16} />
                </span>
                <span
                  className={cn(
                    "truncate text-sm font-medium",
                    canRead || canWrite ? "text-nl-800" : "text-nl-400",
                  )}
                >
                  {PERMISSION_MODULE_LABELS[m]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PermissionStatePill
                  label="Read"
                  icon={Eye}
                  active={canRead}
                />
                <PermissionStatePill
                  label="Write"
                  icon={Pencil}
                  active={canWrite}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const PermissionStatePill: React.FC<{
  label: string;
  icon: LucideIcon;
  active: boolean;
}> = ({ label, icon: Icon, active }) => (
  <span
    className={cn(
      "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold",
      active
        ? "bg-emerald-50 text-emerald-700"
        : "bg-nl-100 text-nl-400",
    )}
  >
    <Icon size={12} />
    {label}
  </span>
);

export default ModulePermissionsView;
