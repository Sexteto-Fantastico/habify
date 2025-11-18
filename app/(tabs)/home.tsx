import * as React from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { HabitCard } from "@/components/habits/HabitCard";
import { Habit } from "@/lib/types";
import { View, ScrollView, Alert } from "react-native";
import { getAllHabits, markHabitCompletion } from "@/api/habit";
import { Button, ButtonText } from "@/components/ui/button";

export default function HomeScreen() {
  const [habits, setHabits] = React.useState<Habit[]>([]);

  React.useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const habits = await getAllHabits();
      setHabits(habits);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    }
  };

  const handleToggleCompletion = async (habitId: number) => {
    try {
      await markHabitCompletion(
        habitId,
        new Date().toISOString().split("T")[0],
        true,
      );
      await loadHabits();
    } catch (error) {
      console.error("Erro ao marcar conclusão do hábito:", error);
      Alert.alert("Erro", "Não foi possível marcar a conclusão do hábito");
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-4 p-4">
        <View>
          <View className="mb-4 gap-1">
            <Text size="3xl">Olá, {"Pedro"}! 👋</Text>
            <Text className="text-background-muted">
              Bora criar bons hábitos juntos!
            </Text>
          </View>
          <View></View>
        </View>
        <View className="gap-3">
          <View className="mb-2 flex flex-row items-center justify-between">
            <Text size="2xl">Hábitos</Text>
            <Button variant="link" size="sm">
              <ButtonText size="sm">Ver todos</ButtonText>
            </Button>
          </View>
          {habits.length === 0 ? (
            <Card>
              <Text className="text-center text-muted-foreground">
                Nenhum hábito criado ainda.
              </Text>
              <Text className="text-center text-sm text-primary underline">
                Crie seu primeiro hábito.
              </Text>
            </Card>
          ) : (
            habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleCompletion={handleToggleCompletion}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
