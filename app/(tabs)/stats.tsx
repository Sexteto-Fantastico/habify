import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { HabitDetailCard } from "@/components/habits/HabitDetailCard";
import { Habit, HabitFrequency, Tag } from "@/lib/types";
import { ArrowLeftIcon, FilterIcon } from "lucide-react-native";
import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { View, ScrollView, Alert } from "react-native";
import { getAllHabits, getHabitCompletions } from "@/api/habit";
import { getHabitStats } from "@/api/stat";
import { getAllTags } from "@/api/tag";
import { FREQUENCY_LABELS } from "@/constants/frequency-labels";
import { StatsFilters } from "@/components/stats/StatsFilters";
import { StatsCard } from "@/components/stats/StatsCard";

export default function StatsScreen() {
  const router = useRouter();
  const [stats, setStats] = React.useState({
    total: 0,
    completed: 0,
    pending: 0,
    notCompleted: 0,
  });
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [allTags, setAllTags] = React.useState<Tag[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<{
    frequency?: HabitFrequency;
    startDate?: string;
    endDate?: string;
    tags?: string[];
  }>({});

  React.useEffect(() => {
    loadStats();
  }, [filters]);

  React.useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error("Erro ao carregar tags:", error);
    }
  };

  const loadStats = async () => {
    try {
      const habitStats = await getHabitStats(
        filters.frequency,
        filters.startDate,
        filters.endDate,
        filters.tags,
      );
      setStats(habitStats);

      const habitsWithTags = await getAllHabits();
      const habitsWithCompletions = await Promise.all(
        habitsWithTags.map(async (habit) => {
          const completions = await getHabitCompletions(
            habit.id,
            filters.startDate,
            filters.endDate,
          );
          return { ...habit, completions };
        }),
      );

      let filteredHabits = habitsWithCompletions;
      if (filters.frequency) {
        filteredHabits = filteredHabits.filter(
          (h) => h.frequency === filters.frequency,
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredHabits = filteredHabits.filter((habit) => {
          const habitTagNames = habit.tags.map((t) => t.name);
          return filters.tags!.some((tag) => habitTagNames.includes(tag));
        });
      }

      setHabits(filteredHabits);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      Alert.alert("Erro", "Não foi possível carregar as estatísticas");
    }
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    loadStats();
  };

  const handleClearFilters = () => {
    setFilters({});
    setShowFilters(false);
  };

  const getCompletionRate = (habit: Habit) => {
    if (habit.completions.length === 0) return 0;
    const completed = habit.completions.filter((c) => c.completed).length;
    return Math.round((completed / habit.completions.length) * 100);
  };

  const getFilterDescription = () => {
    const parts: string[] = [];
    if (filters.frequency)
      parts.push(`Filtrado por: ${FREQUENCY_LABELS[filters.frequency]}`);
    if (filters.startDate && filters.endDate)
      parts.push(`${filters.startDate} a ${filters.endDate}`);
    if (filters.tags && filters.tags.length > 0)
      parts.push(`Tags: ${filters.tags.join(", ")}`);
    return parts.join(" | ");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Estatísticas",
          headerLeft: () => (
            <Button
              size="sm"
              variant="outline"
              onPress={() => router.push("/(tabs)/home")}
              className="mx-4"
            >
              <Icon as={ArrowLeftIcon} />
            </Button>
          ),
          headerRight: () => (
            <Button
              variant="outline"
              size="sm"
              onPress={() => setShowFilters(!showFilters)}
              className="mr-2"
            >
              <Icon as={FilterIcon} />
            </Button>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <View className="gap-4 p-4">
          {showFilters && (
            <StatsFilters
              filters={filters}
              onFiltersChange={setFilters}
              tags={allTags}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
          )}

          <StatsCard
            title="Estatísticas Gerais"
            description={getFilterDescription()}
            stats={stats}
            showCompletionRate
          />

          <View className="gap-3">
            <Text size="2xl">Detalhes por Hábito</Text>
            {habits.length === 0 ? (
              <Card>
                <View className="py-8">
                  <Text className="text-center text-muted-foreground">
                    Nenhum hábito encontrado com os filtros aplicados.
                  </Text>
                </View>
              </Card>
            ) : (
              habits.map((habit) => {
                const completionRate = getCompletionRate(habit);
                const completedCount = habit.completions.filter(
                  (c) => c.completed,
                ).length;
                const totalCount = habit.completions.length;

                return (
                  <HabitDetailCard
                    key={habit.id}
                    habit={habit}
                    completionRate={completionRate}
                    completedCount={completedCount}
                    totalCount={totalCount}
                  />
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
