import { useState } from "react";
import { Search, Plus, FileDown, FileText, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "../components/layout/PageContainer";
import { DayCard } from "../components/notes/DayCard";
import { SummaryCard } from "../components/summaries/SummaryCard";
import { SummaryViewerModal } from "../components/common/SummaryViewerModal";
import { Button } from "../components/common";
import { useStore } from "../stores/useStore";
import type { Summary } from "../types";
import { cn } from "../utils/cn";

type Tab = "notes" | "summaries";

export function HistoryPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [selectedSummary, setSelectedSummary] = useState<{ summary: Summary; date: string } | null>(null);
  const days = useStore((s) => s.days);
  const dayDataCache = useStore((s) => s.dayDataCache);
  const openNoteEditor = useStore((s) => s.openNoteEditor);

  // Gather all summaries from all days
  const allSummaries = days.flatMap((date) => {
    const dayData = dayDataCache[date];
    if (!dayData || !dayData.summaries.length) return [];
    return dayData.summaries.map((summary) => ({ summary, date }));
  });

  // Sort summaries by creation date (most recent first)
  const sortedSummaries = [...allSummaries].sort(
    (a, b) => new Date(b.summary.createdAt).getTime() - new Date(a.summary.createdAt).getTime()
  );

  // Filter based on search
  const filteredDays = days.filter((date) => {
    if (!search.trim()) return true;
    const dayData = dayDataCache[date];
    if (!dayData) return false;
    return dayData.notes.some((note) =>
      note.content.toLowerCase().includes(search.toLowerCase()),
    );
  });

  const filteredSummaries = sortedSummaries.filter(({ summary }) => {
    if (!search.trim()) return true;
    return summary.content.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <PageContainer title={t("history.title")}>
      <div className="space-y-3 pt-2">
        {/* Tabs */}
        <div className="flex gap-1 bg-bg-secondary rounded-lg p-1">
          <button
            onClick={() => setActiveTab("notes")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-colors",
              activeTab === "notes"
                ? "bg-bg-card text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            {t("history.notesTab")}
          </button>
          <button
            onClick={() => setActiveTab("summaries")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-colors",
              activeTab === "summaries"
                ? "bg-bg-card text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("history.summariesTab")}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === "notes" ? t("history.search") : t("history.searchSummaries")}
            className="w-full bg-bg-secondary text-text-primary placeholder-text-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-colors"
          />
        </div>

        {/* Content */}
        {activeTab === "notes" ? (
          filteredDays.length > 0 ? (
            <div className="space-y-2">
              {filteredDays.map((date) => {
                const dayData = dayDataCache[date];
                if (!dayData) return null;
                return (
                  <DayCard
                    key={date}
                    date={date}
                    notes={dayData.notes}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-text-secondary text-sm">{t("history.empty")}</p>
              <p className="text-text-secondary/60 text-xs mt-1">
                {t("history.emptyDesc")}
              </p>
            </div>
          )
        ) : filteredSummaries.length > 0 ? (
          <div className="space-y-2">
            {filteredSummaries.map(({ summary, date }) => (
              <SummaryCard
                key={summary.id}
                date={date}
                summary={summary}
                onClick={() => setSelectedSummary({ summary, date })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-8 w-8 text-text-secondary/40 mb-2" />
            <p className="text-text-secondary text-sm">{t("history.noSummaries")}</p>
            <p className="text-text-secondary/60 text-xs mt-1">
              {t("history.noSummariesDesc")}
            </p>
          </div>
        )}

        {/* Bottom actions */}
        {activeTab === "notes" && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {}}
            >
              <FileDown className="h-4 w-4" />
              {t("history.exportDay")}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => openNoteEditor()}
            >
              <Plus className="h-4 w-4" />
              {t("history.addNote")}
            </Button>
          </div>
        )}
      </div>

      {/* Summary Viewer Modal */}
      <SummaryViewerModal
        open={selectedSummary !== null}
        onClose={() => setSelectedSummary(null)}
        summary={selectedSummary?.summary ?? null}
        date={selectedSummary?.date ?? null}
      />
    </PageContainer>
  );
}
