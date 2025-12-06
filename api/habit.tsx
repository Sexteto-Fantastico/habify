import {
  HabitFrequency,
  Habit,
  HabitCompletion,
  Tag,
  HabitFilter,
} from "@/lib/types";
import api from "@/api/config/axios";

export async function createHabit(
  name: string,
  description: string,
  frequency: HabitFrequency,
  tags: string[] = [],
): Promise<number> {
  return 1;
}

export async function getAllHabits(): Promise<Habit[]> {
  const response = await api.get("/habits/all");
  console.log(response.data);
  var responseMapped = response.data.map((habit: any) => ({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    frequency: habit.frequency,
    createdAt: new Date(habit.createdAt),
    tags: (habit.tags ?? []).map((tag: any) => ({
      ...tag,
      color: tag.color ?? "blue",
    })),
    completions: habit.completions ?? [],
  }));

  return responseMapped;
}

export async function getHabits(habitFilter: HabitFilter): Promise<Habit[]> {
  const response = await api.get(
    `/habits/${habitFilter.createdDate.toISOString().split("T")[0]}`,
  );
  return response.data;
}

export async function getHabitById(id: number): Promise<Habit | null> {
  return null;
}

export async function updateHabit(
  id: number,
  name: string,
  description: string,
  frequency: HabitFrequency,
  tags: number[] = [],
): Promise<void> {}

export async function deleteHabit(id: number): Promise<void> {}

export async function markHabitCompletion(
  habitId: number,
  date?: string,
): Promise<void> {
  await api.post(`/habits/${habitId}/complete`, {
    date: date,
  });
}

export async function getHabitCompletions(
  habitId: number,
  startDate?: string,
  endDate?: string,
): Promise<HabitCompletion[]> {
  return [];
}

export async function getHabitsWithCompletions(
  startDate?: string,
  endDate?: string,
): Promise<Array<Habit>> {
  return [];
}

export async function addTagToHabit(
  habitId: number,
  tagId: number,
): Promise<void> {}

export async function removeTagFromHabit(
  habitId: number,
  tagId: number,
): Promise<void> {}

export async function getHabitTags(habitId: number): Promise<Tag[]> {
  return [];
}

export async function setHabitTags(
  habitId: number,
  tagIds: number[],
): Promise<void> {}
