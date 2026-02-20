import { useState } from "react";
import { Search, Plus, FileDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "../components/layout/PageContainer";
import { DayCard } from "../components/notes/DayCard";
import { Button } from "../components/common";
import { useStore } from "../stores/useStore";

export function HistoryPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const days = useStore((s) => s.days);
  const dayDataCache = useStore((s) => s.dayDataCache);
  const openNoteEditor = useStore((s) => s.openNoteEditor);

  const filteredDays = days.filter((date) => {
    if (!search.trim()) return true;
    const dayData = dayDataCache[date];
    if (!dayData) return false;
    return dayData.notes.some((note) =>
      note.content.toLowerCase().includes(search.toLowerCase()),
    );
  });

  return (
    <PageContainer title={t("history.title")}>
      <div className="space-y-3 pt-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("history.search")}
            className="w-full bg-bg-secondary text-text-primary placeholder-text-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-colors"
          />
        </div>

        {/* Day list */}
        {filteredDays.length > 0 ? (
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
        )}

        {/* Bottom actions */}
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
      </div>
    </PageContainer>
  );
}
