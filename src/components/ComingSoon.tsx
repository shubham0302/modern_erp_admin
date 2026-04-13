import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  return (
    <div className="page-enter flex min-h-[60vh] items-center justify-center">
      <div className="card max-w-lg p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-pl-500 to-pl-700 text-white shadow-lg shadow-pl-500/30">
          <Construction size={28} />
        </div>
        <h2 className="text-nl-900">{title}</h2>
        <p className="mt-2 text-sm text-nl-500">
          {description ??
            "This section is under active development and will be available in an upcoming release."}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          Coming soon
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
