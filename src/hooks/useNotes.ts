import { format } from "date-fns";
import { useStore } from "../stores/useStore";
import type { Note } from "../types";
import { logger } from "../utils/logger";

export function useNotes() {
  const addNote = useStore((s) => s.addNote);
  const updateNote = useStore((s) => s.updateNote);
  const removeNote = useStore((s) => s.removeNote);
  const dayDataCache = useStore((s) => s.dayDataCache);

  const createNote = (data: {
    content: string;
    contentHtml: string;
    tags: string[];
  }) => {
    const now = new Date();
    const date = format(now, "yyyy-MM-dd");
    const note: Note = {
      id: crypto.randomUUID(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      content: data.content,
      contentHtml: data.contentHtml,
      tags: data.tags,
      attachments: [],
    };
    addNote(date, note);
    logger.info("useNotes", `Created note: ${note.id}`);
    return note;
  };

  const editNote = (date: string, noteId: string, updates: Partial<Note>) => {
    updateNote(date, noteId, updates);
    logger.info("useNotes", `Edited note: ${noteId}`);
  };

  const deleteNote = (date: string, noteId: string) => {
    removeNote(date, noteId);
    logger.info("useNotes", `Deleted note: ${noteId}`);
  };

  const getNotesForDay = (date: string): Note[] => {
    return dayDataCache[date]?.notes ?? [];
  };

  return { createNote, editNote, deleteNote, getNotesForDay };
}
