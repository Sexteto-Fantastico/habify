import * as React from "react";
import { Card } from "@/components/ui/card";
import { HabitCard } from "@/components/habits/HabitCard";
import { Habit } from "@/lib/types";
import { View, ScrollView, Alert } from "react-native";
import { markHabitCompletion } from "@/api/habit";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/heading";
import WeekCalendar from "@/components/calendar/WeekCalendar";
import { useAuth } from "@/contexts/AuthContext";

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
  const [habits, setHabits] = React.useState<Habit[]>(initialHabits);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const { user } = useAuth();

  React.useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      //const habits = await getAllHabits();
      //setHabits(habits);
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Buscar os hábitos com a data selecionada: Precisa de um endpoint ou filtro

    console.log('Data selecionada:', date.toISOString().split('T')[0]);
  };

  // Função auxiliar para verificar se um hábito foi completado na data selecionada
  const isHabitCompletedForDate = (habit: Habit, targetDate: Date): boolean => {
    const targetDateString = targetDate.toISOString().split('T')[0];

    const completion = habit.completions.find(comp => {
      const compDateString = new Date(comp.date).toISOString().split('T')[0];
      return compDateString === targetDateString && comp.completed;
    });

    return !!completion;
  };

  const completedHabits: number = habits.filter(habit =>
    isHabitCompletedForDate(habit, selectedDate)
  ).length;
  const totalHabits: number = habits.length;
  const progress: number = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      <ScrollView className="pb-32 gap-4 p-4">
        <View>
          <View className="mb-4 gap-1">
            <Heading size="2xl">Olá, {user?.name || "Fulano"}!</Heading>
            <Text className="text-typography-500">
              Bora criar bons hábitos juntos!
            </Text>
            <Text className="text-gray-500 mt-1">
              {selectedDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
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
        <View className="bg-white rounded-2xl mx-4 mt-4 p-4 shadow-lg">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-800 font-semibold">
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
              ? 'Todos os hábitos concluídos! 🎉'
              : `${Math.round(progress)}% concluído`}
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 mx-4 mt-4 shadow-lg gap-3">
          <View className="flex-row justify-between items-center mb-4">
            <Text size="2xl">Hábitos</Text>
          </View>
          {
            habits.length === 0 ? (
              <Card>
                <Text className="text-center text-muted-foreground">
                  Nenhum hábito criado para o dia.
                </Text>
                <Text className="text-center text-sm text-primary underline">
                  Crie seu primeiro hábito para o dia.
                </Text>
              </Card>
            )  :
              (
                habits.map((habit, index) => (
                  <HabitCard key={habit.id} habit={habit} onToggleCompletion={handleToggleCompletion}/>
                ))
              )
          }
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
