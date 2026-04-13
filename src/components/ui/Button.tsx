import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-pl-500 text-white hover:bg-pl-600 shadow-sm shadow-pl-500/20 disabled:bg-pl-300",
  secondary:
    "bg-white text-nl-700 border border-nl-200 hover:bg-nl-50 disabled:text-nl-400",
  ghost: "text-nl-600 hover:bg-nl-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-2 text-xs",
  md: "h-9 px-3 text-sm",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  ...rest
}) => (
  <button
    {...rest}
    className={cn(
      "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed",
      VARIANTS[variant],
      SIZES[size],
      className,
    )}
  />
);

export default Button;
