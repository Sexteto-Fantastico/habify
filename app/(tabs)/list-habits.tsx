import React, { useEffect, useState } from "react";
import { getAllHabits, markHabitCompletion } from "@/api/habit";
import { Habit } from "@/lib/types";
import { HabitCard } from "@/components/habits/HabitCard";
import { View, ScrollView, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { formatDate } from "@/lib/date";
import { Heading } from "@/components/ui/heading";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";

export default function ListHabitsPage() {
  const router = useRouter();
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

  const groupedHabits = habits.reduce(
    (groups: Record<string, Habit[]>, habit) => {
      const date = habit.createdAt.toISOString().split("T")[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(habit);
      return groups;
    },
    {},
  );

  const sortedDates = Object.keys(groupedHabits).sort((a, b) =>
    b.localeCompare(a),
  );

  const handleToggleCompletion = async (habitId: number) => {
    try {
      await markHabitCompletion(
        habitId,
        new Date().toISOString().split("T")[0],
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

  const completedPerDay = (dayHabits: Habit[]) => {
    return dayHabits.filter((habit) => habit.completions?.length > 0).length;
  };

  const totalCompleted = habits.filter(
    (habit) => habit.completions?.length > 0,
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      <ScrollView showsVerticalScrollIndicator={false} className="pb-32 p-4">
        <VStack space="sm" className="px-4 py-4">
          <Heading size="2xl">Meus Hábitos</Heading>
          <Text className="text-base text-typography-500">
            Acompanhe seus hábitos diários
          </Text>
        </VStack>

        {/* Total Summary */}
        {!loading && habits.length > 0 && (
          <View className="px-6 mb-6 flex-row items-center justify-around bg-primary/10 dark:bg-primary/20 rounded-xl p-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary  dark:text-white">
                {totalCompleted}
              </Text>
              <Text className="text-sm text-muted dark:text-slate-400">
                Completados
              </Text>
            </View>
            <View className="w-px h-12 bg-primary/20 dark:bg-primary/30"></View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary  dark:text-white">
                {habits.length}
              </Text>
              <Text className="text-sm text-muted dark:text-slate-400">
                Total
              </Text>
            </View>
            <View className="w-px h-12 bg-primary/20 dark:bg-primary/30"></View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary dark:text-white">
                {Math.round((totalCompleted / habits.length) * 100)}%
              </Text>
              <Text className="text-sm text-muted dark:text-slate-400">
                Taxa
              </Text>
            </View>
          </View>
        )}

        {loading ? (
          <Text className="text-center mt-8 text-foreground dark:text-slate-300">
            Carregando...
          </Text>
        ) : habits.length === 0 ? (
          <Card>
            <Text className="text-center text-typography-500">
              Sem hábitos ainda.
            </Text>
            <Button variant="link" onPress={() => router.push("/create-habit")}>
              <ButtonText>Crie um novo hábito!</ButtonText>
            </Button>
          </Card>
        ) : (
          <View className="px-6 space-y-4">
            {sortedDates.map((date) => {
              const dayHabits = groupedHabits[date];
              const dayCompleted = completedPerDay(dayHabits);
              return (
                <View
                  key={date}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md"
                >
                  {/* Date Header */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center space-x-3 flex-1">
                      <View className="w-6 h-6 bg-primary dark:bg-primary rounded items-center justify-center">
                        <Text className="text-white text-xs font-bold">📅</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground dark:text-white">
                          {formatDate(date)}
                        </Text>
                      </View>
                    </View>
                    <View className="bg-primary dark:bg-primary rounded-full px-3 py-1">
                      <Text className="text-white text-muted dark:text-slate-400 text-xs font-semibold">
                        {dayCompleted}/{dayHabits.length}
                      </Text>
                    </View>
                  </View>

                  {/* Habits List */}
                  <View className="space-y-3">
                    {dayHabits.map((habit) => (
                      <View
                        key={habit.id}
                        className="border-l-4 border-primary dark:border-primary pl-4 py-2"
                      >
                        <HabitCard
                          habit={habit}
                          onToggleCompletion={handleToggleCompletion}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
