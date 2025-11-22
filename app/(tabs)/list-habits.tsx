import { useEffect, useState } from "react";
import { getAllHabits, markHabitCompletion } from "@/api/habit";
import { Habit } from "@/lib/types";
import { HabitCard } from "@/components/habits/HabitCard";
import { View, ScrollView, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function ListHabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    setLoading(true);
    const data = await getAllHabits();
    setHabits(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const groupedHabits = habits.reduce((groups: Record<string, Habit[]>, habit) => {
    const date = habit.createdAt.toISOString().split("T")[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(habit);
    return groups;
  }, {});

  const handleToggleCompletion = async (habitId: number) => {
    try {
      await markHabitCompletion(
        habitId,
        new Date().toISOString().split("T")[0],
        true,
      );
      setLoading(true);
      const data = await getAllHabits();
      setHabits(data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao marcar conclusão do hábito:", error);
      Alert.alert("Erro", "Não foi possível marcar a conclusão do hábito");
    }
  };

  return (
    <ScrollView className="p-4 pb-32">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold">Hábitos por dia</Text>
        <Button variant="outline" size="sm" onPress={fetchHabits}>
          <ButtonText size="sm">Atualizar</ButtonText>
        </Button>
      </View>
      {loading ? (
        <Text className="text-center">Carregando...</Text>
      ) : (
        Object.entries(groupedHabits).map(([date, habits]) => (
          <View key={date} className="mb-6">
            <Text className="text-lg font-semibold mb-2">{formatDate(date)}</Text>
            <View className="gap-4">
              {habits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggleCompletion={handleToggleCompletion}
                />
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}