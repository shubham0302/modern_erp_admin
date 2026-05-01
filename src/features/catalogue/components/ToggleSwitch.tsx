import { useState } from "react";
import { cn } from "@/utils/cn";
import Dialog from "@/components/ui/Dialog";

interface ToggleSwitchProps {
  active: boolean;
  label: string;
  onToggle: () => void | Promise<void>;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ active, label, onToggle }) => {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onToggle();
      setConfirming(false);
    } catch {
      // parent surfaces the error toast; keep dialog open so user can retry
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setConfirming(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={cn(
          "relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full transition-colors duration-200",
          active ? "bg-sl-500" : "bg-nl-300",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-[16px] w-[16px] rounded-full bg-white shadow-sm transition-transform duration-200",
            active ? "translate-x-[21px]" : "translate-x-[3px]",
            "mt-[3px]",
          )}
        />
      </button>

      <Dialog
        open={confirming}
        onClose={handleClose}
        title={active ? "Deactivate item?" : "Activate item?"}
        subtitle={`Are you sure you want to ${active ? "deactivate" : "activate"} "${label}"?`}
        primaryAction={{
          label: active ? "Deactivate" : "Activate",
          onClick: handleConfirm,
          loading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: handleClose,
          disabled: loading,
        }}
        destructive={active}
      >
        <p className="text-sm text-nl-600">
          {active
            ? "This will make it invisible in the portal and new orders."
            : "This will make it available again in the portal and new orders."}
        </p>
      </Dialog>
    </>
  );
};

export default ToggleSwitch;
