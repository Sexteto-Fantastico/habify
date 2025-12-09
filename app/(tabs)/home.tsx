import * as React from "react";
import { Card } from "@/components/ui/card";
import { HabitCard } from "@/components/habits/HabitCard";
import { Habit } from "@/lib/types";
import { ScrollView, Alert } from "react-native";
import { getAllHabits, getHabits, markHabitCompletion } from "@/api/habit";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/heading";
import WeekCalendar from "@/components/calendar/WeekCalendar";
import StatsProgressionDay from "@/components/stats/StatsProgressionDay";
import { useAuth } from "@/contexts/AuthContext";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";

export default function HomeScreen() {
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const { user } = useAuth();
  const router = useRouter();

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
      const habitsFiltered = await getHabits({ createdDate: selectedDate });

      setHabits(habitsFiltered);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleToggleCompletion = async (habitId: number) => {
    try {
      await markHabitCompletion(
        habitId,
        selectedDate,
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
      <ScrollView showsVerticalScrollIndicator={false} className="pb-32 p-4">
        <VStack space="sm" className="px-4 pt-4">
          <Heading size="2xl">Olá, {user?.name || "Fulano"}! 👋</Heading>
          <Text className="text-typography-500">
            Bora criar bons hábitos juntos!
          </Text>
        </VStack>

        <Box className="mt-4">
          <WeekCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </Box>

        <StatsProgressionDay habits={habits} selectedDate={selectedDate} />

        <Card className="m-1">
          <Box className="flex-row justify-between items-center mb-4">
            <Text size="xl">Hábitos</Text>
            <Button variant="link" onPress={() => router.push("/list-habits")}>
              <ButtonText>Ver Todos</ButtonText>
            </Button>
          </Box>
          {habits.length === 0 ? (
            <Card>
              <Text className="text-center text-typography-500">
                Nenhum hábito criado para o dia.
              </Text>
              <Button
                variant="link"
                onPress={() => router.push("/create-habit")}
              >
                <ButtonText>Crie um novo hábito!</ButtonText>
              </Button>
            </Card>
          ) : (
            <VStack space="sm">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggleCompletion={handleToggleCompletion}
                  date={selectedDate}
                />
              ))}
            </VStack>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
