import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { HabitDetailCard } from "@/components/habits/HabitDetailCard";
import { Habit, HabitFrequency, Tag } from "@/lib/types";
import {
  ArrowLeftIcon,
  FilterIcon,
  TrendingUpIcon,
  CalendarIcon,
  BarChart3Icon,
} from "lucide-react-native";
import { Stack, useRouter } from "expo-router";
import * as React from "react";
import {
  View,
  ScrollView,
  Alert,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { getAllHabits, getHabitCompletions } from "@/api/habit";
import { getHabitStats } from "@/api/stat";
import { getAllTags } from "@/api/tag";
import { FrequencyLabel } from "@/constants/frequency-labels";
import { StatsFilters } from "@/components/stats/StatsFilters";
import { StatsCard } from "@/components/stats/StatsCard";
import { LineChart, BarChart, ProgressChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

// Tipos para os dados do gráfico
interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: () => string;
    strokeWidth?: number;
  }[];
}

export default function StatsScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [stats, setStats] = React.useState({
    total: 0,
    completed: 0,
    pending: 0,
    notCompleted: 0,
    longestStreak: 0,
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

  // Novos estados para gráficos
  const [activityChartData, setActivityChartData] = React.useState<ChartData>({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [weeklyChartData, setWeeklyChartData] = React.useState<ChartData>({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [completionChartData, setCompletionChartData] = React.useState({
    labels: ["Concluídos", "Pendentes"],
    data: [0, 0],
    colors: ["#34C759", "#FF9500"],
  });

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

  // Função para calcular a maior streak
  const calculateLongestStreak = (habitsWithCompletions: any[]) => {
    let longestStreak = 0;

    habitsWithCompletions.forEach((habit) => {
      const completions = habit.completions
        .filter((c: any) => c.completed)
        .map((c: any) => new Date(c.date))
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());

      if (completions.length === 0) return;

      let currentStreak = 1;
      let maxStreak = 1;

      for (let i = 1; i < completions.length; i++) {
        const prevDate = completions[i - 1];
        const currentDate = completions[i];

        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, maxStreak);
    });

    return longestStreak;
  };

  // Função para gerar dados do gráfico de atividades - versão mobile otimizada
  const generateActivityChartData = (habitsWithCompletions: any[]) => {
    const last15Days = Array.from({ length: 15 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (14 - i));
      return date.toISOString().split("T")[0];
    });

    const dailyCompletions = last15Days.map((date) => {
      return habitsWithCompletions.reduce((total, habit) => {
        const hasCompletion = habit.completions.some(
          (c: any) => c.completed && c.date === date,
        );
        return total + (hasCompletion ? 1 : 0);
      }, 0);
    });

    // Labels otimizados para mobile - mostrar menos informações
    const labels = last15Days.map((date, index) => {
      if (index % 3 === 0) {
        // Mostrar apenas a cada 3 dias
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }
      return "";
    });

    return {
      labels,
      datasets: [
        {
          data: dailyCompletions,
          color: () => "#007AFF",
          strokeWidth: 3, // Mais espesso para mobile
        },
      ],
    };
  };

  // Função para gerar dados do gráfico semanal - versão mobile otimizada
  const generateWeeklyChartData = (habitsWithCompletions: any[]) => {
    const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"]; // Abreviado para mobile
    const weeklyCompletions = Array(7).fill(0);

    habitsWithCompletions.forEach((habit) => {
      habit.completions.forEach((completion: any) => {
        if (completion.completed) {
          const date = new Date(completion.date);
          const dayOfWeek = date.getDay();
          weeklyCompletions[dayOfWeek]++;
        }
      });
    });

    return {
      labels: daysOfWeek,
      datasets: [
        {
          data: weeklyCompletions,
          color: () => "#34C759",
        },
      ],
    };
  };

  // Função para gerar dados do gráfico de progresso
  const generateCompletionChartData = (stats: any) => {
    const total = stats.total || 1; // Evitar divisão por zero
    const completedRate = stats.completed / total;
    const pendingRate = stats.pending / total;

    return {
      labels: ["Concluídos", "Pendentes"],
      data: [completedRate, pendingRate],
      colors: ["#34C759", "#FF9500"],
    };
  };

  const loadStats = async () => {
    try {
      const habitStats = await getHabitStats(
        filters.frequency,
        filters.startDate,
        filters.endDate,
        filters.tags,
      );

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

      // Calcula a maior streak
      const longestStreak = calculateLongestStreak(habitsWithCompletions);

      // Gera dados dos gráficos
      const activityData = generateActivityChartData(habitsWithCompletions);
      const weeklyData = generateWeeklyChartData(habitsWithCompletions);
      const completionData = generateCompletionChartData({
        ...habitStats,
        total: habitsWithCompletions.length,
      });

      let filteredHabits = habitsWithCompletions;
      if (filters.frequency) {
        filteredHabits = filteredHabits.filter(
          (h) => h.frequency === filters.frequency,
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredHabits = filteredHabits.filter((habit) => {
          const habitTagNames = habit.tags.map((t: Tag) => t.name);
          return filters.tags!.some((tag) => habitTagNames.includes(tag));
        });
      }

      setStats({
        ...habitStats,
        longestStreak,
      });
      setHabits(filteredHabits);
      setActivityChartData(activityData);
      setWeeklyChartData(weeklyData);
      setCompletionChartData(completionData);
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
      parts.push(`Filtrado por: ${FrequencyLabel[filters.frequency]}`);
    if (filters.startDate && filters.endDate)
      parts.push(`${filters.startDate} a ${filters.endDate}`);
    if (filters.tags && filters.tags.length > 0)
      parts.push(`Tags: ${filters.tags.join(", ")}`);
    return parts.join(" | ");
  };

  // Configurações dos gráficos otimizadas para mobile
  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#007AFF",
    },
    // Configurações específicas para mobile
    propsForLabels: {
      fontSize: 10,
    },
    fillShadowGradientFrom: "#007AFF",
    fillShadowGradientTo: "rgba(0, 122, 255, 0.1)",
  };

  // Dimensões responsivas
  const chartWidth = screenWidth - 32; // 16px de padding em cada lado
  const chartHeight = 200; // Altura fixa para mobile

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
      <SafeAreaView className="flex-1 bg-background-100">
        <ScrollView className="pb-32 p-4" showsVerticalScrollIndicator={false}>
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

          {/* Seção de Gráficos em Grid para Mobile */}
          <View className="gap-4">
            <Text size="xl" weight="semibold">
              Visualizações
            </Text>

            {/* Grid de gráficos - 2 colunas para mobile */}
            <View className="flex-row flex-wrap gap-4">
              {/* Maior Streak - Card menor */}
              <View className="flex-1 min-w-[48%]">
                <Card className="p-3">
                  <View className="items-center gap-2">
                    <Icon
                      as={TrendingUpIcon}
                      size={18}
                      className="text-primary"
                    />
                    <Text size="sm" weight="semibold" className="text-center">
                      Maior Sequência
                    </Text>
                    <View className="items-center">
                      <Text size="xl" weight="bold" className="text-primary">
                        {stats.longestStreak}
                      </Text>
                      <Text
                        size="xs"
                        className="text-muted-foreground text-center"
                      >
                        {stats.longestStreak === 1 ? "dia" : "dias"}{" "}
                        consecutivos
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>

              {/* Gráfico de Progresso - Card menor */}
              <View className="flex-1 min-w-[48%]">
                <Card className="p-3">
                  <View className="items-center gap-2">
                    <Icon
                      as={BarChart3Icon}
                      size={18}
                      className="text-primary"
                    />
                    <Text size="sm" weight="semibold" className="text-center">
                      Progresso
                    </Text>
                    <ProgressChart
                      data={completionChartData}
                      width={80}
                      height={80}
                      strokeWidth={8}
                      radius={32}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1, index) => {
                          return (
                            completionChartData.colors[index] ||
                            `rgba(0, 122, 255, ${opacity})`
                          );
                        },
                      }}
                      hideLegend
                    />
                  </View>
                </Card>
              </View>
            </View>

            {/* Gráfico de Atividades - Largura total */}
            {activityChartData.datasets[0].data.length > 0 && (
              <Card className="p-4">
                <View className="flex-row items-center gap-3 mb-3">
                  <Icon as={CalendarIcon} size={18} className="text-primary" />
                  <Text size="lg" weight="semibold">
                    Atividades (15 dias)
                  </Text>
                </View>
                <LineChart
                  data={activityChartData}
                  width={chartWidth}
                  height={chartHeight}
                  chartConfig={chartConfig}
                  bezier
                  withVerticalLines={false} // Menos linhas para mobile
                  withHorizontalLines={true}
                  withInnerLines={false}
                  withOuterLines={false}
                  style={{
                    borderRadius: 12,
                    paddingRight: 0, // Remove padding extra
                  }}
                  segments={4} // Menos segmentos para mobile
                />
              </Card>
            )}

            {/* Gráfico de Distribuição Semanal - Largura total */}
            {weeklyChartData.datasets[0].data.length > 0 && (
              <Card className="p-4">
                <View className="flex-row items-center gap-3 mb-3">
                  <Icon as={BarChart3Icon} size={18} className="text-primary" />
                  <Text size="lg" weight="semibold">
                    Distribuição Semanal
                  </Text>
                </View>
                <BarChart
                  data={weeklyChartData}
                  width={chartWidth}
                  height={chartHeight}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                    barPercentage: 0.6, // Barras mais finas para mobile
                  }}
                  style={{
                    borderRadius: 12,
                  }}
                  showValuesOnTopOfBars
                  withCustomBarColorFromData={true}
                  flatColor={true}
                  fromZero
                />
              </Card>
            )}
          </View>

          {/* Seção de Detalhes por Hábito */}
          <View className="gap-3 mt-4">
            <Text size="xl" weight="semibold">
              Detalhes por Hábito
            </Text>
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
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
