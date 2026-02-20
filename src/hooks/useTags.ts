import { useStore } from "../stores/useStore";
import type { Tag } from "../types";
import { logger } from "../utils/logger";

export function useTags() {
  const tags = useStore((s) => s.tags);
  const addTag = useStore((s) => s.addTag);
  const updateTag = useStore((s) => s.updateTag);
  const removeTag = useStore((s) => s.removeTag);

  const createTag = (data: { name: string; color: string }) => {
    const tag: Tag = {
      id: crypto.randomUUID(),
      name: data.name,
      color: data.color,
      isDefault: false,
    };
    addTag(tag);
    logger.info("useTags", `Created tag: ${tag.name}`);
    return tag;
  };

  const editTag = (id: string, updates: Partial<Tag>) => {
    updateTag(id, updates);
    logger.info("useTags", `Updated tag: ${id}`);
  };

  const deleteTag = (id: string) => {
    removeTag(id);
    logger.info("useTags", `Deleted tag: ${id}`);
  };

  const getTags = (): Tag[] => tags;

  return { tags, createTag, editTag, deleteTag, getTags };
}
