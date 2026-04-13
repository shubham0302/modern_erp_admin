import { cn } from "@/utils/cn";

interface StatusPillProps {
  active: boolean;
  onToggle?: () => void;
}

const StatusPill: React.FC<StatusPillProps> = ({ active, onToggle }) => (
  <button
    onClick={onToggle}
    disabled={!onToggle}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
      active
        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        : "bg-nl-100 text-nl-500 hover:bg-nl-200",
      onToggle ? "cursor-pointer" : "cursor-default",
    )}
  >
    <span
      className={cn(
        "h-1.5 w-1.5 rounded-full",
        active ? "bg-emerald-500" : "bg-nl-400",
      )}
    />
    {active ? "Active" : "Inactive"}
  </button>
);

export default StatusPill;
