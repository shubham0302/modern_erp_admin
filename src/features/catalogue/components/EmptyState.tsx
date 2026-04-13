import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-nl-200 bg-nl-50/50 py-10 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-nl-400 ring-1 ring-nl-200">
      <Inbox size={20} />
    </div>
    <h4 className="text-sm font-semibold text-nl-700">{title}</h4>
    {description && (
      <p className="mt-1 max-w-xs text-xs text-nl-500">{description}</p>
    )}
  </div>
);

export default EmptyState;
