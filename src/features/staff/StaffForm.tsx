import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Check, ChevronDown, ShieldCheck } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn";
import { listRoles } from "./api";
import type { Role } from "./types";
import type { ApiError } from "@/lib/api/types";

export interface StaffFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
}

export interface StaffFormProps {
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  initialRoleId?: string;
  passwordRequired: boolean;
  passwordHint?: string;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: StaffFormValues) => Promise<void>;
  onCancel: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({
  initialName = "",
  initialEmail = "",
  initialPhone = "",
  initialRoleId = "",
  passwordRequired,
  passwordHint,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(initialRoleId);

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Re-seed if parent's initial values arrive after mount (edit page fetch).
  useEffect(() => setName(initialName), [initialName]);
  useEffect(() => setEmail(initialEmail), [initialEmail]);
  useEffect(() => setPhone(initialPhone), [initialPhone]);
  useEffect(() => setRoleId(initialRoleId), [initialRoleId]);

  useEffect(() => {
    let cancelled = false;
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
        if (!cancelled) setRolesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!roleId) {
      toast.error("Please select a role");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        roleId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitDisabled =
    submitting ||
    !name ||
    !email ||
    !phone ||
    !roleId ||
    (passwordRequired && !password);

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-3xl border border-nl-100 bg-white"
    >
      <div className="flex flex-col gap-4 px-6 py-6 sm:px-8">
        <p className="text-sm font-semibold text-nl-800">Account details</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
            disabled={submitting}
          />
          <Input
            label="Phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9988776655"
            required
            disabled={submitting}
          />
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="staff@modern.com"
          autoComplete="off"
          required
          disabled={submitting}
        />

        <div>
          <Input
            label="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              passwordRequired
                ? "Set a strong password"
                : "Leave empty to keep current password"
            }
            autoComplete="off"
            required={passwordRequired}
            disabled={submitting}
          />
          {passwordHint && (
            <p className="mt-1 text-[11px] text-nl-500">{passwordHint}</p>
          )}
        </div>
      </div>

      <div className="border-t border-nl-100 px-6 py-6 sm:px-8">
        <p className="text-sm font-semibold text-nl-800">Role</p>
        <p className="mt-0.5 text-xs text-nl-500">
          Determines which modules this staff member can access.
        </p>

        <div className="mt-4">
          <p className="mb-1.5 block text-xs font-medium text-nl-700">
            Assigned role
          </p>
          <RoleSelect
            value={roleId}
            options={roles}
            loading={rolesLoading}
            disabled={submitting}
            onChange={setRoleId}
          />
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
        <Button type="submit" disabled={submitDisabled}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
};

interface RoleSelectProps {
  value: string;
  options: Role[];
  loading: boolean;
  disabled?: boolean;
  onChange: (id: string) => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({
  value,
  options,
  loading,
  disabled,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, [open]);

  const isDisabled = disabled || loading;
  const placeholder = loading
    ? "Loading roles…"
    : options.length === 0
      ? "No roles available — create one first"
      : "Select a role";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          if (!isDisabled && options.length > 0) setOpen((v) => !v);
        }}
        disabled={isDisabled || options.length === 0}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 text-sm transition-colors focus:outline-none",
          open
            ? "border-pl-500 ring-2 ring-pl-500/30"
            : "border-nl-200 hover:border-nl-300",
          isDisabled
            ? "cursor-not-allowed bg-nl-50 text-nl-400"
            : "cursor-pointer",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md",
              selected ? "bg-pl-50 text-pl-600" : "bg-nl-100 text-nl-400",
            )}
          >
            <ShieldCheck size={13} />
          </span>
          <span
            className={cn(
              "truncate font-medium",
              selected ? "text-nl-900" : "text-nl-400",
            )}
          >
            {selected?.name ?? placeholder}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={cn(
            "shrink-0 text-nl-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 z-30 mt-2 max-h-64 overflow-auto rounded-xl border border-nl-100 bg-white p-1 shadow-lg">
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-pl-50 text-pl-700"
                    : "text-nl-700 hover:bg-nl-50 hover:text-nl-900",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md",
                      isSelected
                        ? "bg-white text-pl-600"
                        : "bg-nl-100 text-nl-400",
                    )}
                  >
                    <ShieldCheck size={13} />
                  </span>
                  <span className="truncate font-medium">{option.name}</span>
                </span>
                {isSelected && (
                  <Check size={14} className="shrink-0 text-pl-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffForm;
