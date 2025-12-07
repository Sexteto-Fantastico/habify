import { HabitFrequency } from "@/lib/types";
import api from "./config/axios";

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
  longestStreak?: number;
}> {
  try {
    const params: any = {};

    if (frequency) {
      params.frequency = frequency;
    }

    if (startDate) {
      params.startDate = startDate;
    }

    if (endDate) {
      params.endDate = endDate;
    }

    if (tags && tags.length > 0) {
      params.tags = tags.join(",");
    }

    const response = await api.get("/stats", { params });
    const habitsStats = response.data.data;

    let totalHabits = habitsStats.length;
    let completedHabits = 0;
    let pendingHabits = 0;
    let notCompletedHabits = 0;

    habitsStats.forEach((habitStat: any) => {
      if (habitStat.positive >= habitStat.expected) {
        completedHabits++;
      } else if (habitStat.negative > 0) {
        notCompletedHabits++;
      } else {
        pendingHabits++;
      }
    });
    const longestStreak = 0;

    return {
      total: totalHabits,
      completed: completedHabits,
      pending: pendingHabits,
      notCompleted: notCompletedHabits,
      longestStreak,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);

    return {
      total: 0,
      completed: 0,
      pending: 0,
      notCompleted: 0,
      longestStreak: 0,
    };
  }
}
