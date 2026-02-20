import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface PageContainerProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function PageContainer({ title, children, className }: PageContainerProps) {
  return (
    <div className="flex flex-col h-full w-full">
      {title && (
        <div className="shrink-0 px-4 pt-4 pb-2">
          <h1 className="text-lg font-bold text-text-primary">{title}</h1>
        </div>
      )}
      <div
        className={cn(
          "flex-1 overflow-y-auto px-4 pb-16",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
