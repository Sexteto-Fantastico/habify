import * as React from "react";
import { View } from "react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Habit } from "@/lib/types";

interface StatesProgressionDayProps {
  habits: Habit[];
  selectedDate: Date;

}

const StatsProgressionDay = ({habits,selectedDate}: StatesProgressionDayProps) => {

  // Função auxiliar para verificar se um hábito foi completado na data selecionada
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
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-semibold" size="2xl">
          Progresso do Dia
        </Text>
        <Text className="text-gray-600">
          {completedHabits}/{totalHabits}
        </Text>
      </View>

      <View className="w-full bg-gray-200 rounded-full h-3">
        <View
          className="bg-green-500 h-3 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      <Text className="text-green-500 text-sm mt-2 font-medium">
        {progress === 100
          ? "Todos os hábitos concluídos! 🎉"
          : `${Math.round(progress)}% concluído`}
      </Text>
    </Card>
  )
}

export default StatsProgressionDay;
