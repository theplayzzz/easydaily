import { X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function Titlebar() {
  const handleClose = () => {
    getCurrentWindow().hide();
  };

  return (
    <div
      data-tauri-drag-region
      className="shrink-0 flex items-center justify-between h-8 bg-bg-secondary border-b border-border select-none"
    >
      <span
        data-tauri-drag-region
        className="text-xs font-semibold text-text-secondary pl-3"
      >
        EasyDaily
      </span>
      <button
        onClick={handleClose}
        className="flex items-center justify-center w-8 h-8 text-text-secondary hover:text-text-primary hover:bg-state-error/20 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
