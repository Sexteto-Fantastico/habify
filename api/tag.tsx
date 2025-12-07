import { Tag } from "@/lib/types";
import api from "./config/axios";

export async function createTag(name: string, color?: string): Promise<number> {
  const response = await api.post("/tags", { name, color });
  const tag: Tag = response.data;
  return tag.id;
}

export async function getAllTags(): Promise<Tag[]> {
  const response = await api.get("/tags");
  const tags: Tag[] = response.data;
  return tags;
}

export async function updateTag(
  id: number,
  name: string,
  color?: string,
): Promise<void> {
  await api.put(`/tags/${id}`, { name, color });
}

export async function deleteTag(id: number): Promise<void> {
  await api.delete(`/tags/${id}`);
}
