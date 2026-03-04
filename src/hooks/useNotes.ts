import { format } from "date-fns";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../stores/useStore";
import type { Note } from "../types";
import { logger } from "../utils/logger";

export function useNotes() {
  const addNote = useStore((s) => s.addNote);
  const updateNote = useStore((s) => s.updateNote);
  const removeNote = useStore((s) => s.removeNote);
  const dayDataCache = useStore((s) => s.dayDataCache);
  const days = useStore((s) => s.days);
  const setDays = useStore((s) => s.setDays);

  const createNote = async (data: {
    content: string;
    contentHtml: string;
    tags: string[];
    date?: string;
  }) => {
    const date = data.date || format(new Date(), "yyyy-MM-dd");
    const note = await invoke<Note>("create_note", {
      date,
      content: data.content,
      contentHtml: data.contentHtml,
      tags: data.tags,
    });
    addNote(date, note);
    if (!days.includes(date)) {
      setDays([date, ...days]);
    }
    logger.info("useNotes", `Created note: ${note.id}`);
    return note;
  };

  const editNote = async (date: string, noteId: string, updates: Partial<Note>) => {
    const note = await invoke<Note>("update_note", {
      date,
      noteId,
      content: updates.content ?? null,
      contentHtml: updates.contentHtml ?? null,
      tags: updates.tags ?? null,
    });
    updateNote(date, noteId, note);
    logger.info("useNotes", `Edited note: ${noteId}`);
  };

  const deleteNote = async (date: string, noteId: string) => {
    await invoke("delete_note", { date, noteId });
    removeNote(date, noteId);
    logger.info("useNotes", `Deleted note: ${noteId}`);
  };

  const getNotesForDay = (date: string): Note[] => {
    return dayDataCache[date]?.notes ?? [];
  };

  return { createNote, editNote, deleteNote, getNotesForDay };
}
