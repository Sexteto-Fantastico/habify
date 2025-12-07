import * as React from "react";
import { View } from "react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Habit } from "@/lib/types";
import { Box } from "../ui/box";

interface StatesProgressionDayProps {
  habits: Habit[];
  selectedDate: Date;
}

const StatsProgressionDay = ({
  habits,
  selectedDate,
}: StatesProgressionDayProps) => {

  const isHabitCompletedForDate = (habit: Habit, targetDate: Date): boolean => {
    const targetDateString = targetDate.toISOString().split("T")[0];

    const completion = habit.completions.find((comp) => {
      const compDateString = new Date(comp.date).toISOString().split("T")[0];
      return compDateString === targetDateString && comp.completed;
    });

    return !!completion;
  };

  const completedHabits: number = habits.filter((habit) =>
    isHabitCompletedForDate(habit, selectedDate),
  ).length;
  const totalHabits: number = habits.length;
  const progress: number =
    totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  return (
    <Card className="m-1">
      <Box className="flex-row justify-between items-center mb-2">
        <Text className="font-semibold" size="xl">
          Progresso do dia
        </Text>
        <Text className="text-typography-600">
          {completedHabits}/{totalHabits}
        </Text>
      </Box>

      <Box className="w-full bg-typography-100 rounded-full h-3">
        <Box
          className="bg-success-500 h-3 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </Box>

      <Text className="text-success-500 text-sm mt-2 font-medium">
        {progress === 100
          ? "Todos os hábitos concluídos! "
          : `${Math.round(progress)}% concluído`}
      </Text>
    </Card>
  );
};

export default StatsProgressionDay;
