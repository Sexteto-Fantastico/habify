import { HabitFrequency, Habit, HabitCompletion } from "@/lib/types";

export async function getHabitStats(
  frequency?: HabitFrequency,
  startDate?: string,
  endDate?: string,
  tags?: string[],
): Promise<{
  total: number;
  completed: number;
  pending: number;
  notCompleted: number;
}> {
  return {
    total: 1,
    completed: 1,
    pending: 1,
    notCompleted: 1,
  };
}
