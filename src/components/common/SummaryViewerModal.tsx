import { useState } from "react";
import { Sparkles, Copy, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Modal } from "./Modal";
import type { Summary } from "../../types";

interface SummaryViewerModalProps {
  open: boolean;
  onClose: () => void;
  summary: Summary | null;
  date: string | null;
}

const summaryTypeLabels: Record<string, string> = {
  daily: "Today's Summary",
  combined: "Yesterday + Today",
  standup: "Daily Standup",
};

export function SummaryViewerModal({ open, onClose, summary, date }: SummaryViewerModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!summary || !date) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-primary" />
          <span className="text-sm font-medium text-text-primary">
            {summaryTypeLabels[summary.type] || summary.type}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-card"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-text-secondary">
            {format(new Date(date), "dd/MM/yyyy")} • {format(new Date(summary.createdAt), "HH:mm")}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded-md hover:bg-bg-card"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-accent-primary" />
                <span className="text-accent-primary">{t("aiResult.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>{t("aiResult.copy")}</span>
              </>
            )}
          </button>
        </div>

        <div className="prose prose-sm prose-invert max-w-none text-sm text-text-primary">
          {summary.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return (
                <h3 key={i} className="text-sm font-bold text-text-primary mt-3 mb-1">
                  {line.replace("## ", "")}
                </h3>
              );
            }
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={i} className="font-semibold text-text-primary mt-2 mb-1">
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <p key={i} className="text-text-secondary pl-3 py-0.5">
                  {line}
                </p>
              );
            }
            if (line.trim() === "") return <br key={i} />;
            return (
              <p key={i} className="text-text-secondary">
                {line}
              </p>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary/60">
            {t("aiResult.generatedBy")} • {summary.provider}
          </span>
          <button
            onClick={onClose}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
