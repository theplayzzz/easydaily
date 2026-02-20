import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import { NoteItem } from "./NoteItem";
import type { Note } from "../../types";

interface DayCardProps {
  date: string;
  notes: Note[];
}

export function DayCard({ date, notes }: DayCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  const parsedDate = parseISO(date);
  let dateLabel: string;
  if (isToday(parsedDate)) {
    dateLabel = t("common.today");
  } else if (isYesterday(parsedDate)) {
    dateLabel = t("common.yesterday");
  } else {
    dateLabel = format(parsedDate, "dd 'de' MMMM", { locale: ptBR });
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-card hover:bg-bg-card/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">{dateLabel}</span>
          <span className="text-xs text-text-secondary">
            {notes.length} {notes.length === 1 ? "nota" : "notas"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-text-secondary transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="divide-y divide-border">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} date={date} />
          ))}
        </div>
      </div>
    </div>
  );
}
