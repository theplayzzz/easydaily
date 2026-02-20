import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlock from "@tiptap/extension-code-block";
import { Bold, Italic, Code, List, Paperclip } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Modal, Button, TagChip } from "../common";
import { useStore } from "../../stores/useStore";
import { useNotes } from "../../hooks/useNotes";
import { cn } from "../../utils/cn";

export function NoteEditorModal() {
  const { t } = useTranslation();
  const { open, noteId } = useStore((s) => s.modals.noteEditor);
  const closeNoteEditor = useStore((s) => s.closeNoteEditor);
  const tags = useStore((s) => s.tags);
  const dayDataCache = useStore((s) => s.dayDataCache);
  const { createNote, editNote } = useNotes();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Find existing note if editing
  const existingNote = noteId
    ? Object.values(dayDataCache)
        .flatMap((d) => d.notes)
        .find((n) => n.id === noteId)
    : null;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlock,
      Placeholder.configure({
        placeholder: t("noteEditor.placeholder"),
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-sm text-text-primary",
      },
    },
  });

  // Set content when editing existing note
  useEffect(() => {
    if (open && editor) {
      if (existingNote) {
        editor.commands.setContent(existingNote.contentHtml);
        setSelectedTags(existingNote.tags);
      } else {
        editor.commands.clearContent();
        setSelectedTags([]);
      }
    }
  }, [open, existingNote, editor]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSave = async () => {
    if (!editor) return;
    const content = editor.getText();
    const contentHtml = editor.getHTML();
    if (!content.trim()) return;

    try {
      if (existingNote) {
        const date = Object.entries(dayDataCache).find(([, d]) =>
          d.notes.some((n) => n.id === noteId),
        )?.[0];
        if (date && noteId) {
          await editNote(date, noteId, { content, contentHtml, tags: selectedTags });
        }
      } else {
        await createNote({ content, contentHtml, tags: selectedTags });
      }
      closeNoteEditor();
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const toolbarButtons = [
    {
      icon: Bold,
      action: () => editor?.chain().focus().toggleBold().run(),
      active: editor?.isActive("bold"),
    },
    {
      icon: Italic,
      action: () => editor?.chain().focus().toggleItalic().run(),
      active: editor?.isActive("italic"),
    },
    {
      icon: Code,
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
      active: editor?.isActive("codeBlock"),
    },
    {
      icon: List,
      action: () => editor?.chain().focus().toggleBulletList().run(),
      active: editor?.isActive("bulletList"),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={closeNoteEditor}
      title={existingNote ? t("noteEditor.editTitle") : t("noteEditor.title")}
    >
      <div className="flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
          {toolbarButtons.map(({ icon: Icon, action, active }, i) => (
            <button
              key={i}
              onClick={action}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                active
                  ? "bg-accent-primary/20 text-accent-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />

        {/* Tags */}
        <div className="px-4 py-2 border-t border-border">
          <span className="text-xs text-text-secondary mb-1.5 block">
            {t("noteEditor.tags")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagChip
                key={tag.id}
                name={tag.name}
                color={tag.color}
                selected={selectedTags.includes(tag.id)}
                onClick={() => toggleTag(tag.id)}
              />
            ))}
          </div>
        </div>

        {/* Attachments placeholder */}
        <div className="px-4 py-2 border-t border-border">
          <button className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
            <Paperclip className="h-3.5 w-3.5" />
            {t("noteEditor.addAttachment")}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 py-3 border-t border-border">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={closeNoteEditor}
          >
            {t("noteEditor.cancel")}
          </Button>
          <Button size="sm" className="flex-1" onClick={handleSave}>
            {t("noteEditor.save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
