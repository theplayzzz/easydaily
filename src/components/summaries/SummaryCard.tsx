import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import type { Summary } from "../../types";

interface SummaryCardProps {
  date: string;
  summary: Summary;
  onClick: () => void;
}

const summaryTypeLabels: Record<string, string> = {
  daily: "Today's Summary",
  combined: "Yesterday + Today",
  standup: "Daily Standup",
};

export function SummaryCard({ date, summary, onClick }: SummaryCardProps) {
  const preview = summary.content.slice(0, 80) + (summary.content.length > 80 ? "..." : "");

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-bg-card border border-border rounded-lg p-3 hover:border-accent-primary/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-accent-primary flex-shrink-0" />
            <span className="text-xs font-medium text-accent-primary">
              {summaryTypeLabels[summary.type] || summary.type}
            </span>
            <span className="text-xs text-text-secondary/60">•</span>
            <span className="text-xs text-text-secondary/60">
              {format(new Date(summary.createdAt), "HH:mm")}
            </span>
          </div>
          <p className="text-xs text-text-secondary line-clamp-2">{preview}</p>
        </div>
        <div className="text-xs text-text-secondary/60 group-hover:text-text-secondary transition-colors">
          {format(new Date(date), "dd/MM")}
        </div>
      </div>
    </button>
  );
}
