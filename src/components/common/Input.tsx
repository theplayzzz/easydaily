import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full bg-bg-secondary text-text-primary placeholder-text-secondary",
        "border rounded-lg px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary",
        "transition-colors duration-150",
        error ? "border-state-error" : "border-border",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full bg-bg-secondary text-text-primary placeholder-text-secondary",
        "border rounded-lg px-3 py-2 text-sm resize-none",
        "focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary",
        "transition-colors duration-150",
        error ? "border-state-error" : "border-border",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
