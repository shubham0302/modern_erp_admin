import { Plus, Search } from "lucide-react";
import Button from "@/components/ui/Button";

interface ToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  placeholder: string;
  addLabel: string;
  onAdd: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  search,
  onSearchChange,
  placeholder,
  addLabel,
  onAdd,
}) => (
  <div className="mb-4 flex flex-wrap items-center gap-3">
    <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-nl-200 bg-white px-3">
      <Search size={16} className="text-nl-400" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-nl-700 placeholder:text-nl-400 focus:outline-none"
      />
    </div>
    <Button onClick={onAdd}>
      <Plus size={16} />
      {addLabel}
    </Button>
  </div>
);

export default Toolbar;
