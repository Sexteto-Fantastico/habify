import React, { useEffect, useState } from "react";
import { getAllHabits, markHabitCompletion } from "@/api/habit";
import { getAllTags } from "@/api/tag";
import { Habit, HabitFrequency, Tag } from "@/lib/types";
import { HabitCard } from "@/components/habits/HabitCard";
import { View, ScrollView, Alert, RefreshControl } from "react-native";
import { Text } from "@/components/ui/text";
import { formatDate } from "@/lib/date";
import { Heading } from "@/components/ui/heading";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { CalendarRangeIcon, FilterIcon } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { FiltersActionSheet } from "@/components/stats/FiltersActionSheet";
import { Filters } from "@/components/stats/StatsFilters";

export default function ListHabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => {
    // Initialize with default date range (first of month to today)
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      startDate: firstOfMonth.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  });

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const startDate = filters.startDate;
      const endDate = filters.endDate
        ? `${filters.endDate}T23:59:00`
        : undefined;

      const data = await getAllHabits(startDate, endDate);

      // Apply frequency and tags filters if provided
      let filteredData = data;

      if (filters.frequency) {
        filteredData = filteredData.filter(
          (h) => h.frequency === filters.frequency,
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredData = filteredData.filter((habit) => {
          const habitTagNames = habit.tags?.map((t) => t.name) || [];
          return filters.tags!.some((tagName) =>
            habitTagNames.includes(tagName),
          );
        });
      }

      setHabits(filteredData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsData = await getAllTags();
        setAllTags(tagsData || []);
      } catch (error) {
        console.error("Erro ao carregar tags:", error);
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [filters]);

  const handleToggleCompletion = async (habitId: number) => {
    try {
      await markHabitCompletion(habitId, new Date());
      await fetchHabits();
    } catch (error) {
      console.error("Erro ao marcar conclusão do hábito:", error);
      Alert.alert("Erro", "Não foi possível marcar a conclusão do hábito");
    }
  };

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setFilters({
      startDate: firstOfMonth.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
  };

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

  const completedPerDay = (dayHabits: Habit[]) =>
    dayHabits.filter((habit) => habit.completions?.length > 0).length;

  const totalCompleted = habits.filter(
    (habit) => habit.completions?.length > 0,
  ).length;

  return (
    <>
      <SafeAreaView className="bg-background-100 p-4">
        <HStack className="items-center justify-between px-4 pt-4">
          <VStack space="sm">
            <Heading size="2xl">Meus Hábitos</Heading>
            <Text className="text-base text-typography-500">
              Acompanhe seus hábitos diários
            </Text>
          </VStack>
          <Button
            variant="solid"
            action="primary"
            onPress={() => setShowFilters(true)}
          >
            <ButtonIcon as={FilterIcon} />
          </Button>
        </HStack>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-background-100 p-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchHabits} />
        }
      >
        <Box className="pb-32">
          {/* Total Summary */}
          {!loading && habits.length > 0 && (
            <Card className="flex-row items-center mb-6 p-4">
              <Box className="items-center flex-1">
                <Text size="xl" className="font-bold text-typography-950">
                  {habits.length}
                </Text>
                <Text size="sm" className="text-typography-500">
                  Total
                </Text>
              </Box>

              <Box className="items-center flex-1">
                <Text size="xl" className="font-bold text-typography-950">
                  {totalCompleted}
                </Text>
                <Text size="sm" className="text-typography-500">
                  Completos
                </Text>
              </Box>

              <Box className="items-center flex-1">
                <Text size="xl" className="font-bold text-typography-950">
                  {Math.round((totalCompleted / habits.length) * 100)}%
                </Text>
                <Text size="sm" className="text-typography-500">
                  Taxa
                </Text>
              </Box>
            </Card>
          )}

          {loading ? (
            <Text className="text-center mt-8 text-typography-500">
              Carregando...
            </Text>
          ) : habits.length === 0 ? (
            <Card>
              <Box className="rounded-md border border-dashed border-outline-100 p-4">
                <Text className="text-center text-typography-500">
                  Sem hábitos ainda.
                </Text>
                <Button
                  variant="link"
                  onPress={() => router.push("/create-habit")}
                >
                  <ButtonText>Crie um novo hábito!</ButtonText>
                </Button>
              </Box>
            </Card>
          ) : (
            <View className="gap-4">
              {sortedDates.map((date) => {
                const dayHabits = groupedHabits[date];
                const dayCompleted = completedPerDay(dayHabits);

                return (
                  <Card key={date}>
                    {/* Date Header */}
                    <Box className="flex-row items-center justify-between mb-4">
                      <Box className="flex-row items-center space-x-3 flex-1">
                        <Box className="items-center justify-center mr-2">
                          <Icon as={CalendarRangeIcon} size="sm" />
                        </Box>
                        <Box className="flex-1">
                          <Text className="text-lg font-semibold">
                            {formatDate(date)}
                          </Text>
                        </Box>
                      </Box>
                      <Box>
                        <Text className="text-typography-600 text-sm font-semibold">
                          {dayCompleted}/{dayHabits.length}
                        </Text>
                      </Box>
                    </Box>

                    {/* Habits List */}
                    <View className="space-y-3">
                      {dayHabits.map((habit) => (
                        <View
                          key={habit.id}
                          className="border-l-4 border-primary-500 pl-4 py-2"
                        >
                          <HabitCard
                            habit={habit}
                            date={new Date(date)}
                            onToggleCompletion={handleToggleCompletion}
                          />
                        </View>
                      ))}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </Box>
      </ScrollView>

      <FiltersActionSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        initialFilters={filters}
        tags={allTags}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        title="Filtrar Hábitos"
      />
    </>
  );
}
