import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotes } from "../../hooks/useNotes";
import { useStore } from "../../stores/useStore";
import { TagChip } from "../common";

interface NoteItemProps {
  note: {
    id: string;
    createdAt: string;
    content: string;
    tags: string[];
  };
  date: string;
}

export function NoteItem({ note, date }: NoteItemProps) {
  const { t } = useTranslation();
  const tags = useStore((s) => s.tags);
  const openNoteEditor = useStore((s) => s.openNoteEditor);
  const openConfirmation = useStore((s) => s.openConfirmation);
  const { deleteNote } = useNotes();

  const time = format(parseISO(note.createdAt), "HH:mm");
  const noteTags = tags.filter((tag) => note.tags.includes(tag.id));
  const preview =
    note.content.length > 80 ? note.content.slice(0, 80) + "..." : note.content;

  const handleDelete = () => {
    openConfirmation(
      t("confirmation.deleteNote"),
      t("confirmation.deleteNoteMsg"),
      () => deleteNote(date, note.id),
    );
  };

  return (
    <div className="group px-4 py-3 hover:bg-bg-secondary/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-text-secondary font-mono">{time}</span>
            {noteTags.map((tag) => (
              <TagChip key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
          <p className="text-sm text-text-primary truncate">{preview}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => openNoteEditor(note.id)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            title={t("common.edit")}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-text-secondary hover:text-state-error hover:bg-bg-card transition-colors"
            title={t("common.delete")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
