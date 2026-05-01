import { Pencil, Trash2 } from "lucide-react";

interface RowActionsProps {
  onEdit: () => void;
  onDelete?: () => void;
}

const RowActions: React.FC<RowActionsProps> = ({ onEdit, onDelete }) => (
  <div className="flex items-center gap-1">
    <button
      onClick={onEdit}
      className="rounded-lg p-2 text-nl-500 hover:bg-pl-50 hover:text-pl-600"
      title="Edit"
    >
      <Pencil size={15} />
    </button>
    {onDelete && (
      <button
        onClick={onDelete}
        className="rounded-lg p-2 text-nl-500 hover:bg-rose-50 hover:text-rose-600"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    )}
  </div>
);

export default RowActions;
