import { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ hoverable = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-border rounded-lg p-4",
        hoverable && "hover:border-accent-primary/50 cursor-pointer transition-colors duration-150",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
