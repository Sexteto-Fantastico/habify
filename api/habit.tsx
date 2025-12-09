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
  const response = await api.post("/habits", {
    name,
    description,
    frequency,
    tags,
  });
  return response.data.id;
}

export async function getAllHabits(
  startDate?: string,
  endDate?: string,
): Promise<Habit[]> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get("/habits/all", { params });

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
    completions: (habit.completions ?? []).map((completion: any) => ({
      ...completion,
      date: completion.date ? new Date(completion.date) : completion.date,
    })),
  }));

  return responseMapped;
}

export async function getHabits(habitFilter: HabitFilter): Promise<Habit[]> {
  const date = habitFilter.createdDate;
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const response = await api.get(
    `/habits/${utcDate.toISOString().split("T")[0]}`,
  );
  return response.data;
}

export async function markHabitCompletion(
  habitId: number,
  date: Date,
): Promise<void> {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  await api.post(`/habits/${habitId}/complete`, {
    date: utcDate.toISOString().split("T")[0],
  });
}
