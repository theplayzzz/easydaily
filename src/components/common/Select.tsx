import { type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full appearance-none bg-bg-secondary text-text-primary",
          "border border-border rounded-lg px-3 py-2 pr-8 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary",
          "transition-colors duration-150",
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
    </div>
  );
}
