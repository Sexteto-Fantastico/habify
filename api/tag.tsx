import { Tag } from "@/lib/types";

export async function createTag(name: string, color?: string): Promise<number> {
  return 1;
}

export async function getAllTags(): Promise<Tag[]> {
  return [];
}

export async function getTagById(id: number): Promise<Tag | null> {
  return null;
}

export async function updateTag(
  id: number,
  name: string,
  color?: string,
): Promise<void> {}

export async function deleteTag(id: number): Promise<void> {}
