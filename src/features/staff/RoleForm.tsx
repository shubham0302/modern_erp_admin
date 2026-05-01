import { useEffect, useState, type FormEvent } from "react";
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
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn";
import {
  PERMISSION_MODULES,
  PERMISSION_MODULE_LABELS,
  type Permission,
  type PermissionModule,
} from "./types";

type PermissionState = Record<
  PermissionModule,
  { canRead: boolean; canWrite: boolean }
>;

const MODULE_ICON: Record<PermissionModule, LucideIcon> = {
  dashboard: LayoutDashboard,
  designs: Palette,
  inventory: Boxes,
  production: Factory,
  order: ShoppingCart,
  finance: Wallet,
};

const emptyPermissions = (): PermissionState =>
  PERMISSION_MODULES.reduce((acc, m) => {
    acc[m] = { canRead: false, canWrite: false };
    return acc;
  }, {} as PermissionState);

const seedFromList = (list: Permission[]): PermissionState => {
  const next = emptyPermissions();
  for (const p of list) {
    if (next[p.module]) {
      next[p.module] = { canRead: p.canRead, canWrite: p.canWrite };
    }
  }
  return next;
};

export interface RoleFormValues {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface RoleFormProps {
  initialName?: string;
  initialDescription?: string;
  initialPermissions?: Permission[];
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: RoleFormValues) => Promise<void>;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({
  initialName = "",
  initialDescription = "",
  initialPermissions,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [permissions, setPermissions] = useState<PermissionState>(() =>
    initialPermissions ? seedFromList(initialPermissions) : emptyPermissions(),
  );
  const [submitting, setSubmitting] = useState(false);

  // If the parent re-mounts with different initials (e.g. edit page finishes
  // its fetch), seed our state from them.
  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
    setPermissions(
      initialPermissions ? seedFromList(initialPermissions) : emptyPermissions(),
    );
  }, [initialName, initialDescription, initialPermissions]);

  const togglePermission = (
    module: PermissionModule,
    field: "canRead" | "canWrite",
  ) => {
    setPermissions((prev) => {
      const current = prev[module];
      const nextVal = !current[field];
      const next = { ...current, [field]: nextVal };
      // Write requires read: enabling write enables read; disabling read
      // disables write so the state is always logically consistent.
      if (field === "canWrite" && nextVal) next.canRead = true;
      if (field === "canRead" && !nextVal) next.canWrite = false;
      return { ...prev, [module]: next };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim()) return;
    setSubmitting(true);
    const permList: Permission[] = PERMISSION_MODULES.filter(
      (m) => permissions[m].canRead || permissions[m].canWrite,
    ).map((m) => ({
      module: m,
      canRead: permissions[m].canRead,
      canWrite: permissions[m].canWrite,
    }));
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: permList,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-3xl border border-nl-100 bg-white"
    >
      <div className="flex flex-col gap-4 px-6 py-6 sm:px-8">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Audit Manager"
          disabled={submitting}
          required
        />
        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this role do?"
          disabled={submitting}
        />
      </div>

      <div className="border-t border-nl-100 px-6 py-6 sm:px-8">
        <div className="mb-4">
          <p className="text-sm font-semibold text-nl-800">Module access</p>
          <p className="mt-0.5 text-xs text-nl-500">
            Pick what each module is allowed. Selecting Write will automatically
            enable Read.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-nl-100 bg-nl-50/40">
          <ul className="divide-y divide-nl-100">
            {PERMISSION_MODULES.map((m) => {
              const Icon = MODULE_ICON[m];
              const { canRead, canWrite } = permissions[m];
              return (
                <li
                  key={m}
                  className="flex items-center justify-between gap-3 bg-white/60 px-4 py-3 transition-colors hover:bg-white"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pl-50 text-pl-600">
                      <Icon size={16} />
                    </span>
                    <span className="truncate text-sm font-medium text-nl-800">
                      {PERMISSION_MODULE_LABELS[m]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PermissionPill
                      label="Read"
                      icon={Eye}
                      active={canRead}
                      disabled={submitting}
                      onClick={() => togglePermission(m, "canRead")}
                    />
                    <PermissionPill
                      label="Write"
                      icon={Pencil}
                      active={canWrite}
                      disabled={submitting}
                      onClick={() => togglePermission(m, "canWrite")}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-nl-100 bg-nl-50/60 px-6 py-4 sm:px-8">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || !name.trim()}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
};

interface PermissionPillProps {
  label: string;
  icon: LucideIcon;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const PermissionPill: React.FC<PermissionPillProps> = ({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    className={cn(
      "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all disabled:cursor-not-allowed",
      active
        ? "bg-pl-500 text-white shadow-sm shadow-pl-500/25 hover:bg-pl-600"
        : "bg-white text-nl-600 ring-1 ring-nl-200 hover:bg-nl-50 hover:text-nl-800",
    )}
  >
    <Icon size={13} />
    {label}
  </button>
);

export default RoleForm;
