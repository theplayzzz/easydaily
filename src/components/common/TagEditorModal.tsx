import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { TagChip } from "./TagChip";
import { useStore } from "../../stores/useStore";
import { useTags } from "../../hooks/useTags";
import { cn } from "../../utils/cn";

const presetColors = [
  "#39FF14", "#00D4FF", "#BF40FF", "#FF4444", "#FFAA00",
  "#FF69B4", "#00FF88", "#FFD700", "#FF6B35", "#8B5CF6",
];

export function TagEditorModal() {
  const { t } = useTranslation();
  const { open, tagId } = useStore((s) => s.modals.tagEditor);
  const closeTagEditor = useStore((s) => s.closeTagEditor);
  const tags = useStore((s) => s.tags);
  const { createTag, editTag } = useTags();
  const [name, setName] = useState("");
  const [color, setColor] = useState(presetColors[0]);

  const existingTag = tagId ? tags.find((t) => t.id === tagId) : null;

  useEffect(() => {
    if (open) {
      if (existingTag) {
        setName(existingTag.name);
        setColor(existingTag.color);
      } else {
        setName("");
        setColor(presetColors[0]);
      }
    }
  }, [open, existingTag]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (existingTag) {
      editTag(existingTag.id, { name: name.trim(), color });
    } else {
      createTag({ name: name.trim(), color });
    }
    closeTagEditor();
  };

  return (
    <Modal
      open={open}
      onClose={closeTagEditor}
      title={existingTag ? t("tagEditor.editTitle") : t("tagEditor.title")}
    >
      <div className="px-4 py-4 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">
            {t("tagEditor.name")}
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("tagEditor.namePlaceholder")}
          />
        </div>

        {/* Color picker */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">
            {t("tagEditor.color")}
          </label>
          <div className="flex flex-wrap gap-2">
            {presetColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-all",
                  color === c
                    ? "border-white scale-110"
                    : "border-transparent hover:scale-105",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">
            {t("tagEditor.preview")}
          </label>
          <div className="py-1">
            <TagChip name={name || "Tag"} color={color} selected />
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3 border-t border-border">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={closeTagEditor}
        >
          {t("tagEditor.cancel")}
        </Button>
        <Button size="sm" className="flex-1" onClick={handleSave}>
          {t("tagEditor.save")}
        </Button>
      </div>
    </Modal>
  );
}
