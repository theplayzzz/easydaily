import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface TagChipProps {
  name: string;
  color: string;
  selected?: boolean;
  removable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function TagChip({
  name,
  color,
  selected = false,
  removable = false,
  onClick,
  onRemove,
}: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        "transition-all duration-150 cursor-pointer",
        selected ? "ring-2 ring-offset-1 ring-offset-bg-primary" : "opacity-70 hover:opacity-100",
      )}
      style={{
        backgroundColor: `${color}20`,
        color,
        borderColor: color,
        ...(selected ? { ringColor: color } : {}),
      }}
      onClick={onClick}
    >
      {name}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="hover:bg-white/20 rounded-full p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
