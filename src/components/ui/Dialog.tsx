import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import Button from "./Button";

interface DialogAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
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
  const busy = Boolean(primaryAction?.loading || secondaryAction?.loading);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, busy]);

  if (!open) return null;

  const handleBackdropClick = () => {
    if (!busy) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-nl-900/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
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
            disabled={busy}
            className="rounded-lg p-1 text-nl-400 hover:bg-nl-100 hover:text-nl-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {(primaryAction || secondaryAction) && (
          <div className="flex items-center justify-end gap-2 border-t border-nl-100 bg-nl-50/60 px-6 py-3">
            {secondaryAction && (
              <Button
                variant="secondary"
                disabled={
                  secondaryAction.disabled ||
                  secondaryAction.loading ||
                  primaryAction?.loading
                }
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.loading && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant={destructive ? "danger" : "primary"}
                disabled={primaryAction.disabled || primaryAction.loading}
                onClick={primaryAction.onClick}
              >
                {primaryAction.loading && (
                  <Loader2 size={14} className="animate-spin" />
                )}
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
