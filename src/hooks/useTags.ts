import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../stores/useStore";
import type { Tag } from "../types";
import { logger } from "../utils/logger";

export function useTags() {
  const tags = useStore((s) => s.tags);
  const addTag = useStore((s) => s.addTag);
  const updateTag = useStore((s) => s.updateTag);
  const removeTag = useStore((s) => s.removeTag);

  const createTag = async (data: { name: string; color: string }) => {
    const tag = await invoke<Tag>("create_tag", {
      name: data.name,
      color: data.color,
    });
    addTag(tag);
    logger.info("useTags", `Created tag: ${tag.name}`);
    return tag;
  };

  const editTag = async (id: string, updates: Partial<Tag>) => {
    const tag = await invoke<Tag>("update_tag", {
      id,
      name: updates.name ?? null,
      color: updates.color ?? null,
    });
    updateTag(id, tag);
    logger.info("useTags", `Updated tag: ${id}`);
  };

  const deleteTag = async (id: string) => {
    await invoke("delete_tag", { id });
    removeTag(id);
    logger.info("useTags", `Deleted tag: ${id}`);
  };

  const getTags = (): Tag[] => tags;

  return { tags, createTag, editTag, deleteTag, getTags };
}
