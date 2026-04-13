import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, id, ...rest }) => {
  const inputId = id ?? rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-nl-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...rest}
        className={cn(
          "h-10 w-full rounded-xl border bg-white px-3 text-sm text-nl-900 placeholder:text-nl-400 focus:ring-2 focus:ring-pl-500/30 focus:outline-none",
          error
            ? "border-rose-400 focus:border-rose-500"
            : "border-nl-200 focus:border-pl-500",
          className,
        )}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export default Input;
