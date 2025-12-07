import { Tag } from "@/lib/types";

export async function createTag(name: string, color?: string): Promise<number> {
  return 1;
}

export async function getAllTags(): Promise<Tag[]> {
  return [
    { id: 1, name: "Exercício", color: "#34D399", createdAt: new Date() },
    { id: 2, name: "Leitura", color: "#60A5FA", createdAt: new Date() },
    { id: 3, name: "Meditação", color: "#FBBF24", createdAt: new Date() },
    { id: 4, name: "Água", color: "#38BDF8", createdAt: new Date() },
    { id: 5, name: "Sono", color: "#A78BFA", createdAt: new Date() },
  ];
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
