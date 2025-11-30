import * as React from "react";
import { Card } from "@/components/ui/card";
import { HabitCard } from "@/components/habits/HabitCard";
import { Habit } from "@/lib/types";
import { View, ScrollView, Alert } from "react-native";
import { getAllHabits, getHabits, markHabitCompletion } from "@/api/habit";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/heading";
import WeekCalendar from "@/components/calendar/WeekCalendar";
import StatsProgressionDay from "@/components/stats/StatsProgressionDay";

const initialHabits: Habit[] = [
  {
    id: 1,
    name: "Beber Água",
    description: "Beber 8 copos de água por dia",
    frequency: "daily",
    completions: [],
    tags: [
      {
        id: 1,
        name: "Saúde",
        color: "blue",
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Academia",
    description: "Ir uma vez ao dia na academia",
    frequency: "daily",
    completions: [],
    tags: [
      {
        id: 1,
        name: "Saúde",
        color: "blue",
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
  },
];

export default function HomeScreen() {
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  React.useEffect(() => {
    loadHabits();
  }, []);

  React.useEffect(() => {
    loadFilteredHabits();
  }, [selectedDate]);

  const loadHabits = async () => {
    try {
      const habits = await getAllHabits();
      setHabits(habits);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    }
  };

  const loadFilteredHabits = async () => {
    try {
      const habitsFiltered = await getHabits({ createdDate: selectedDate});
      setHabits(habitsFiltered);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  const handleToggleCompletion = async (habitId: number) => {
    try {
      await markHabitCompletion(
        habitId,
        new Date().toISOString().split("T")[0],
        true,
      );
      await loadFilteredHabits();
    } catch (error) {
      console.error("Erro ao marcar conclusão do hábito:", error);
      Alert.alert("Erro", "Não foi possível marcar a conclusão do hábito");
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      <ScrollView className="pb-32 gap-4 p-4">
        <View>
          <View className="mb-4 gap-1">
            <Heading size="2xl">Olá, {"Fulano"}!</Heading>
            <Text className="text-typography-500">
              Bora criar bons hábitos juntos!
            </Text>
            <Text className="text-gray-500 mt-1" >
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
        </View>
        <View className="mt-4">
          <WeekCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </View>
        {/* Progresso do Dia */}
        <StatsProgressionDay habits={habits} selectedDate={selectedDate} />

        <Card className="m-1">
          <View className="flex-row justify-between items-center mb-4">
            <Text size="2xl">Hábitos</Text>
          </View>
          {habits.length === 0 ? (
            <Card>
              <Text className="text-center text-muted-foreground" size="2xl">
                Nenhum hábito criado para o dia.
              </Text>
              <Text className="text-center text-sm text-primary underline" size="2xl">
                Crie seu primeiro hábito para o dia.
              </Text>
            </Card>
          ) : (
            habits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleCompletion={handleToggleCompletion}
              />
            ))
          )}
        </Card>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
