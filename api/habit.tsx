import { HabitFrequency, Habit, HabitCompletion, Tag } from "@/lib/types";

export async function createHabit(
  name: string,
  description: string,
  frequency: HabitFrequency,
  tagIds: number[] = [],
): Promise<number> {
  return 1;
}

export async function getAllHabits(): Promise<Habit[]> {
  return [];
}

export async function getHabitById(id: number): Promise<Habit | null> {
  return null;
}

export async function updateHabit(
  id: number,
  name: string,
  description: string,
  frequency: HabitFrequency,
  tagIds: number[] = [],
): Promise<void> {}

export async function deleteHabit(id: number): Promise<void> {}

export async function markHabitCompletion(
  habitId: number,
  date: string,
  completed: boolean,
): Promise<void> {}

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
