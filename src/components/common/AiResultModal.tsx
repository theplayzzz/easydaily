import { useState } from "react";
import { Loader2, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useStore } from "../../stores/useStore";
import { useAiSummary } from "../../hooks/useAiSummary";

function mapErrorToKey(error: string): string {
  if (error.includes("INVALID_API_KEY")) return "aiResult.errorInvalidKey";
  if (error.includes("NO_CONNECTION")) return "aiResult.errorNoConnection";
  if (error.includes("RATE_LIMITED")) return "aiResult.errorRateLimited";
  if (error.includes("TIMEOUT")) return "aiResult.errorTimeout";
  return "aiResult.error";
}

export function AiResultModal() {
  const { t } = useTranslation();
  const { open, state, content, summaryType } = useStore((s) => s.modals.aiResult);
  const closeAiResult = useStore((s) => s.closeAiResult);
  const { generateDailySummary, generateCombinedSummary, generateStandup } = useAiSummary();
  const [copied, setCopied] = useState(false);

  const handleRetry = () => {
    switch (summaryType) {
      case "daily_summary":
        generateDailySummary();
        break;
      case "combined_summary":
        generateCombinedSummary();
        break;
      case "standup":
        generateStandup("");
        break;
      default:
        generateDailySummary();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={closeAiResult} title={t("aiResult.title")}>
      <div className="px-4 py-4">
        {state === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-accent-primary animate-spin mb-3" />
            <p className="text-sm text-text-secondary">{t("aiResult.loading")}</p>
          </div>
        )}

        {state === "success" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-primary" />
                <span className="text-xs text-text-secondary font-medium">
                  {t("aiResult.generatedBy")}
                </span>
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
              {content.split("\n").map((line, i) => {
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
        )}

        {state === "error" && (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-state-error mb-3" />
            <p className="text-sm text-text-secondary mb-4 text-center">
              {t(mapErrorToKey(content))}
            </p>
            <Button variant="secondary" size="sm" onClick={handleRetry}>
              {t("aiResult.retry")}
            </Button>
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-border">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={closeAiResult}
        >
          {t("aiResult.close")}
        </Button>
      </div>
    </Modal>
  );
}
