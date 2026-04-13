import { X } from "lucide-react";
import { useEffect } from "react";
import Button from "./Button";

interface DialogAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  destructive?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  destructive,
}) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-nl-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-nl-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-nl-900">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-nl-500">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-nl-400 hover:bg-nl-100 hover:text-nl-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {(primaryAction || secondaryAction) && (
          <div className="flex items-center justify-end gap-2 border-t border-nl-100 bg-nl-50/60 px-6 py-3">
            {secondaryAction && (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant={destructive ? "danger" : "primary"}
                disabled={primaryAction.disabled}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
