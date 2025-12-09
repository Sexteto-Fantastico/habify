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
  XIcon,
  CheckCircleIcon,
  TargetIcon,
  BarChartIcon,
  ActivityIcon,
  GitCompareIcon,
} from "lucide-react-native";
import { Stack, useRouter } from "expo-router";
import * as React from "react";
import {
  View,
  ScrollView,
  Alert,
  useWindowDimensions,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { getAllHabits } from "@/api/habit";
import { getHabitStats } from "@/api/stat";
import { getAllTags } from "@/api/tag";
import { StatsCard } from "@/components/stats/StatsCard";
import { LineChart, BarChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { FiltersActionSheet } from "@/components/stats/FiltersActionSheet";
import { Filters } from "@/components/stats/StatsFilters";

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

interface HabitWithCompletions extends Habit {
  completions: any[];
  completionRate: number;
}

export default function StatsScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = React.useState(screenWidth - 32);

  const [stats, setStats] = React.useState({
    total: 0,
    completed: 0,
    pending: 0,
    notCompleted: 0,
    longestStreak: 0,
    completionRate: 0,
    dailyCompletionRate: 0,
    weeklyCompletionRate: 0,
    monthlyCompletionRate: 0,
    bestDay: { date: "", rate: 0 },
    worstDay: { date: "", rate: 100 },
  });

  const [habits, setHabits] = React.useState<HabitWithCompletions[]>([]);
  const [allTags, setAllTags] = React.useState<Tag[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const [activityChartData, setActivityChartData] = React.useState<ChartData>({
    labels: [],
    datasets: [{ data: [] }],
  });

  const [frequencyChartData, setFrequencyChartData] = React.useState<ChartData>(
    {
      labels: ["Diário", "Semanal", "Mensal"],
      datasets: [{ data: [0, 0, 0] }],
    },
  );

  const [comparisonChartData, setComparisonChartData] =
    React.useState<ChartData>({
      labels: ["Diário", "Semanal", "Mensal"],
      datasets: [{ data: [0, 0, 0] }],
    });

  const [activitiesComparisonChartData, setActivitiesComparisonChartData] =
    React.useState<ChartData>({
      labels: [],
      datasets: [
        { data: [], color: () => "rgba(0, 122, 255, 1)", strokeWidth: 2 },
        { data: [], color: () => "rgba(52, 199, 89, 1)", strokeWidth: 2 },
        { data: [], color: () => "rgba(255, 149, 0, 1)", strokeWidth: 2 },
      ],
    });

  const [dailyHabits, setDailyHabits] = React.useState<HabitWithCompletions[]>(
    [],
  );
  const [weeklyHabits, setWeeklyHabits] = React.useState<
    HabitWithCompletions[]
  >([]);
  const [monthlyHabits, setMonthlyHabits] = React.useState<
    HabitWithCompletions[]
  >([]);

  const getDefaultDateRange = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
      frequency: undefined,
      tags: undefined,
    };
  };

  const [filters, setFilters] = React.useState<Filters>(getDefaultDateRange());

  const onContainerLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;

    setContainerWidth(width - 32);
  };

  const getCompletionDateString = (c: any): string | null => {
    if (!c) return null;

    const dateValue = c.date || c.completedAt || c.createdAt;
    if (!dateValue) return null;

    try {
      const d = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  const wasHabitCompletedOnDate = (habit: Habit, dateStr: string): boolean => {
    if (!habit.completions || !Array.isArray(habit.completions)) return false;

    return habit.completions.some((completion) => {
      const completionDate = getCompletionDateString(completion);
      return completionDate === dateStr;
    });
  };

  const calculateLongestStreak = (
    habitsWithCompletions: HabitWithCompletions[],
  ): number => {
    let longestStreak = 0;

    habitsWithCompletions.forEach((habit) => {
      const completionDates = habit.completions
        ?.map((c) => getCompletionDateString(c))
        .filter((date): date is string => date !== null)
        .map((date) => new Date(date))
        .filter((date) => !isNaN(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      if (!completionDates || completionDates.length === 0) return;

      let currentStreak = 1;
      let maxStreak = 1;

      for (let i = 1; i < completionDates.length; i++) {
        const prevDate = completionDates[i - 1];
        const currentDate = completionDates[i];

        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

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

  const calculateCompletionStats = (habitsList: HabitWithCompletions[]) => {
    if (habitsList.length === 0) return { total: 0, completed: 0, rate: 0 };

    let totalOpportunities = 0;
    let completedCount = 0;

    habitsList.forEach((habit) => {
      if (habit.completions && Array.isArray(habit.completions)) {
        totalOpportunities += 1;
        completedCount += habit.completions.length > 0 ? 1 : 0;
      }
    });

    const rate =
      habitsList.length > 0
        ? Math.round((completedCount / habitsList.length) * 100)
        : 0;

    return { total: habitsList.length, completed: completedCount, rate };
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);

      const tagsData = await getAllTags();
      setAllTags(tagsData || []);

      const allHabits = await getAllHabits();

      const dailyHabitsList = allHabits.filter((h) => h.frequency === "daily");
      const weeklyHabitsList = allHabits.filter(
        (h) => h.frequency === "weekly",
      );
      const monthlyHabitsList = allHabits.filter(
        (h) => h.frequency === "monthly",
      );

      let filteredHabits = [...allHabits];

      if (filters.frequency) {
        filteredHabits = filteredHabits.filter(
          (h) => h.frequency === filters.frequency,
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredHabits = filteredHabits.filter((habit) => {
          const habitTagNames = habit.tags?.map((t) => t.name) || [];
          return filters.tags!.some((tagName) =>
            habitTagNames.includes(tagName),
          );
        });
      }

      const habitsWithCompletions = filteredHabits.map((habit) => {
        let completions = habit.completions || [];

        if (filters.startDate || filters.endDate) {
          const startDate = filters.startDate
            ? new Date(filters.startDate)
            : null;
          const endDate = filters.endDate ? new Date(filters.endDate) : null;

          completions = completions.filter((completion) => {
            const completionDate = getCompletionDateString(completion);
            if (!completionDate) return false;

            const date = new Date(completionDate);

            if (startDate && date < startDate) return false;
            if (endDate && date > endDate) return false;

            return true;
          });
        }

        let totalOpportunities = 0;

        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          const daysInPeriod =
            Math.floor(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
            ) + 1;

          switch (habit.frequency) {
            case "daily":
              totalOpportunities = daysInPeriod;
              break;
            case "weekly":
              totalOpportunities = Math.ceil(daysInPeriod / 7);
              break;
            case "monthly":
              totalOpportunities = Math.ceil(daysInPeriod / 30);
              break;
            default:
              totalOpportunities = daysInPeriod;
          }
        } else {
          totalOpportunities =
            habit.frequency === "daily"
              ? 30
              : habit.frequency === "weekly"
                ? 4
                : 1;
        }

        const completionRate =
          totalOpportunities > 0
            ? Math.min(
                Math.round((completions.length / totalOpportunities) * 100),
                100,
              )
            : 0;

        return {
          ...habit,
          completions,
          completionRate,
        };
      });

      const dailyStats = calculateCompletionStats(
        dailyHabitsList
          .map((h) => ({
            ...h,
            completions: h.completions || [],
            completionRate: 0,
          }))
          .filter((h) => {
            let completions = h.completions || [];
            if (filters.startDate || filters.endDate) {
              const startDate = filters.startDate
                ? new Date(filters.startDate)
                : null;
              const endDate = filters.endDate
                ? new Date(filters.endDate)
                : null;

              completions = completions.filter((completion) => {
                const completionDate = getCompletionDateString(completion);
                if (!completionDate) return false;

                const date = new Date(completionDate);

                if (startDate && date < startDate) return false;
                if (endDate && date > endDate) return false;

                return true;
              });
            }
            return true;
          }),
      );

      const weeklyStats = calculateCompletionStats(
        weeklyHabitsList
          .map((h) => ({
            ...h,
            completions: h.completions || [],
            completionRate: 0,
          }))
          .filter((h) => {
            let completions = h.completions || [];
            if (filters.startDate || filters.endDate) {
              const startDate = filters.startDate
                ? new Date(filters.startDate)
                : null;
              const endDate = filters.endDate
                ? new Date(filters.endDate)
                : null;

              completions = completions.filter((completion) => {
                const completionDate = getCompletionDateString(completion);
                if (!completionDate) return false;

                const date = new Date(completionDate);

                if (startDate && date < startDate) return false;
                if (endDate && date > endDate) return false;

                return true;
              });
            }
            return true;
          }),
      );

      const monthlyStats = calculateCompletionStats(
        monthlyHabitsList
          .map((h) => ({
            ...h,
            completions: h.completions || [],
            completionRate: 0,
          }))
          .filter((h) => {
            let completions = h.completions || [];
            if (filters.startDate || filters.endDate) {
              const startDate = filters.startDate
                ? new Date(filters.startDate)
                : null;
              const endDate = filters.endDate
                ? new Date(filters.endDate)
                : null;

              completions = completions.filter((completion) => {
                const completionDate = getCompletionDateString(completion);
                if (!completionDate) return false;

                const date = new Date(completionDate);

                if (startDate && date < startDate) return false;
                if (endDate && date > endDate) return false;

                return true;
              });
            }
            return true;
          }),
      );

      const allStats = calculateCompletionStats(habitsWithCompletions);

      const longestStreak = calculateLongestStreak(habitsWithCompletions);
      const dailyActivityStats = calculateDailyActivityStats(
        habitsWithCompletions,
      );

      setStats({
        total: allStats.total,
        completed: allStats.completed,
        pending: 0,
        notCompleted: Math.max(0, allStats.total - allStats.completed),
        longestStreak,
        completionRate: allStats.rate,
        dailyCompletionRate: dailyStats.rate,
        weeklyCompletionRate: weeklyStats.rate,
        monthlyCompletionRate: monthlyStats.rate,
        bestDay: dailyActivityStats.bestDay,
        worstDay: dailyActivityStats.worstDay,
      });

      setHabits(habitsWithCompletions);
      setDailyHabits(
        dailyHabitsList.map((h) => ({
          ...h,
          completions: h.completions || [],
          completionRate: calculateCompletionStats([
            {
              ...h,
              completions: h.completions || [],
              completionRate: 0,
            },
          ]).rate,
        })),
      );
      setWeeklyHabits(
        weeklyHabitsList.map((h) => ({
          ...h,
          completions: h.completions || [],
          completionRate: calculateCompletionStats([
            {
              ...h,
              completions: h.completions || [],
              completionRate: 0,
            },
          ]).rate,
        })),
      );
      setMonthlyHabits(
        monthlyHabitsList.map((h) => ({
          ...h,
          completions: h.completions || [],
          completionRate: calculateCompletionStats([
            {
              ...h,
              completions: h.completions || [],
              completionRate: 0,
            },
          ]).rate,
        })),
      );

      generateChartData(
        habitsWithCompletions,
        dailyHabitsList,
        weeklyHabitsList,
        monthlyHabitsList,
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as estatísticas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  const calculateDailyActivityStats = (
    habitsWithCompletions: HabitWithCompletions[],
  ) => {
    const activitiesMap: Record<string, { completed: number; total: number }> =
      {};

    let startDate: Date;
    let endDate: Date;

    if (filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 29);
    }

    const datesInRange: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      datesInRange.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    datesInRange.forEach((date) => {
      activitiesMap[date] = { completed: 0, total: 0 };
    });

    habitsWithCompletions.forEach((habit) => {
      datesInRange.forEach((date) => {
        activitiesMap[date].total++;

        if (wasHabitCompletedOnDate(habit, date)) {
          activitiesMap[date].completed++;
        }
      });
    });

    const activities = datesInRange.map((date) => {
      const data = activitiesMap[date];
      const successRate =
        data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

      return {
        date,
        completed: data.completed,
        total: data.total,
        successRate,
      };
    });

    let bestDay = { date: "", rate: 0 };
    let worstDay = { date: "", rate: 100 };

    activities.forEach((activity) => {
      if (activity.total > 0) {
        if (activity.successRate > bestDay.rate) {
          bestDay = { date: activity.date, rate: activity.successRate };
        }
        if (activity.successRate < worstDay.rate) {
          worstDay = { date: activity.date, rate: activity.successRate };
        }
      }
    });

    return { activities, bestDay, worstDay };
  };

  const generateChartData = (
    allHabits: HabitWithCompletions[],
    dailyHabits: Habit[],
    weeklyHabits: Habit[],
    monthlyHabits: Habit[],
  ) => {
    let startDate: Date;
    let endDate: Date;

    if (filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 14);
    }

    const datesInRange: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate && datesInRange.length < 15) {
      datesInRange.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const dailyCompletions = datesInRange.map((date) => {
      return allHabits.reduce((total: number, habit: HabitWithCompletions) => {
        if (wasHabitCompletedOnDate(habit, date)) {
          return total + 1;
        }
        return total;
      }, 0);
    });

    const labels = datesInRange.map((date, index) => {
      if (
        index % Math.max(1, Math.floor(datesInRange.length / 5)) === 0 ||
        index === datesInRange.length - 1
      ) {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }
      return "";
    });

    setActivityChartData({
      labels,
      datasets: [
        {
          data: dailyCompletions,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    });

    setActivityChartData({
      labels,
      datasets: [
        {
          data: dailyCompletions,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    });

    const filterCompletionsByPeriod = (completions: any[]) => {
      if (!filters.startDate && !filters.endDate) return completions;

      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      return completions.filter((completion) => {
        const completionDate = getCompletionDateString(completion);
        if (!completionDate) return false;

        const date = new Date(completionDate);

        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;

        return true;
      });
    };

    const dailyCompleted = dailyHabits.reduce(
      (sum: number, habit: Habit) =>
        sum + filterCompletionsByPeriod(habit.completions || []).length,
      0,
    );
    const weeklyCompleted = weeklyHabits.reduce(
      (sum: number, habit: Habit) =>
        sum + filterCompletionsByPeriod(habit.completions || []).length,
      0,
    );
    const monthlyCompleted = monthlyHabits.reduce(
      (sum: number, habit: Habit) =>
        sum + filterCompletionsByPeriod(habit.completions || []).length,
      0,
    );

    setFrequencyChartData({
      labels: ["Diário", "Semanal", "Mensal"],
      datasets: [
        {
          data: [dailyCompleted, weeklyCompleted, monthlyCompleted],
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    });

    const calculateRateForHabits = (habitsList: Habit[]) => {
      if (habitsList.length === 0) return 0;

      let completedCount = 0;
      habitsList.forEach((habit) => {
        const filteredCompletions = filterCompletionsByPeriod(
          habit.completions || [],
        );
        if (filteredCompletions.length > 0) {
          completedCount++;
        }
      });

      return Math.round((completedCount / habitsList.length) * 100);
    };

    const dailyRate = calculateRateForHabits(dailyHabits);
    const weeklyRate = calculateRateForHabits(weeklyHabits);
    const monthlyRate = calculateRateForHabits(monthlyHabits);

    setComparisonChartData({
      labels: ["Diário", "Semanal", "Mensal"],
      datasets: [
        {
          data: [dailyRate, weeklyRate, monthlyRate],
          color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    }).filter((date) => {
      if (filters.startDate && date < new Date(filters.startDate)) return false;
      if (filters.endDate && date > new Date(filters.endDate)) return false;
      return true;
    });

    const comparisonLabels = last7Days.map((date, index) => {
      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      return dayNames[date.getDay()];
    });

    const dailyData = last7Days.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      return dailyHabits.reduce(
        (total: number, habit: Habit) =>
          total + (wasHabitCompletedOnDate(habit, dateStr) ? 1 : 0),
        0,
      );
    });

    const weeklyData = last7Days.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      return weeklyHabits.reduce(
        (total: number, habit: Habit) =>
          total + (wasHabitCompletedOnDate(habit, dateStr) ? 1 : 0),
        0,
      );
    });

    const monthlyData = last7Days.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      return monthlyHabits.reduce(
        (total: number, habit: Habit) =>
          total + (wasHabitCompletedOnDate(habit, dateStr) ? 1 : 0),
        0,
      );
    });

    setActivitiesComparisonChartData({
      labels: comparisonLabels,
      datasets: [
        {
          data: dailyData,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: weeklyData,
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: monthlyData,
          color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    });
  };

  React.useEffect(() => {
    loadData();
  }, []);

  React.useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [filters]);

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters(getDefaultDateRange());
    setShowFilters(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#007AFF",
    },
    propsForLabels: { fontSize: Platform.OS === "ios" ? 10 : 9 },
    fillShadowGradientFrom: "#007AFF",
    fillShadowGradientTo: "rgba(0, 122, 255, 0.1)",
  };
  const chartWidth = Math.min(containerWidth, screenWidth - 32);
  const chartHeight = 180;

  const hasActivityData =
    activityChartData.datasets[0]?.data?.some((val) => val > 0) || false;
  const hasFrequencyData =
    frequencyChartData.datasets[0]?.data?.some((val) => val > 0) || false;
  const hasComparisonData =
    comparisonChartData.datasets[0]?.data?.some((val) => val > 0) || false;
  const hasActivitiesComparisonData =
    activitiesComparisonChartData.datasets.some((dataset) =>
      dataset.data?.some((val) => val > 0),
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="bg-background-100 p-4">
        <HStack className="items-center justify-between px-4 pt-4">
          <VStack space="sm">
            <Heading size="2xl">Estatísticas</Heading>
            <Text className="text-typography-500">
              Consulte sua evolução e desempenho!
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
        className="p-4 bg-background-100"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      >
        <Box className="pb-32">
          {loading && !refreshing && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={{ marginTop: 12, color: "#666" }}>
                Carregando estatísticas...
              </Text>
            </View>
          )}

          <StatsCard stats={stats} />

          <View style={{ gap: 16, marginTop: 24 }}>
            <Text size="xl" className="font-bold">
              Por Frequência
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              <View style={{ flex: 1, minWidth: "30%" }}>
                <Card className="p-4 bg-primary-50">
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <Icon
                      as={CalendarIcon}
                      size="md"
                      className="text-primary-600"
                    />
                    <Text
                      size="sm"
                      className="font-semibold text-center text-primary-700"
                    >
                      Diário
                    </Text>
                    <View style={{ alignItems: "center" }}>
                      <Text size="xl" className="font-bold text-primary-600">
                        {dailyHabits.length}
                      </Text>
                      <Text size="xs" className="text-primary-500 text-center">
                        hábitos
                      </Text>
                      <Text
                        size="sm"
                        className="font-semibold text-primary-600 mt-2"
                      >
                        {stats.dailyCompletionRate}% sucesso
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>

              <View style={{ flex: 1, minWidth: "30%" }}>
                <Card className="p-4 bg-success-50">
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <Icon
                      as={CalendarIcon}
                      size="md"
                      className="text-success-600"
                    />
                    <Text
                      size="sm"
                      className="font-semibold text-center text-success-700"
                    >
                      Semanal
                    </Text>
                    <View style={{ alignItems: "center" }}>
                      <Text size="xl" className="font-bold text-success-600">
                        {weeklyHabits.length}
                      </Text>
                      <Text size="xs" className="text-success-500 text-center">
                        hábitos
                      </Text>
                      <Text
                        size="sm"
                        className="font-semibold text-success-600 mt-2"
                      >
                        {stats.weeklyCompletionRate}% sucesso
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>

              <View style={{ flex: 1, minWidth: "30%" }}>
                <Card className="p-4 bg-purple-50">
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <Icon
                      as={CalendarIcon}
                      size="md"
                      className="text-purple-600"
                    />
                    <Text
                      size="sm"
                      className="font-semibold text-center text-purple-700"
                    >
                      Mensal
                    </Text>
                    <View style={{ alignItems: "center" }}>
                      <Text size="xl" className="font-bold text-purple-600">
                        {monthlyHabits.length}
                      </Text>
                      <Text size="xs" className="text-purple-500 text-center">
                        hábitos
                      </Text>
                      <Text
                        size="sm"
                        className="font-semibold text-purple-600 mt-2"
                      >
                        {stats.monthlyCompletionRate}% sucesso
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>
            </View>

            {hasFrequencyData && (
              <Card className="p-4" onLayout={onContainerLayout}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <Icon as={BarChartIcon} size="md" className="text-primary" />
                  <Text size="lg" className="font-semibold">
                    Hábitos Completados por Frequência
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -4 }}
                >
                  <BarChart
                    data={frequencyChartData}
                    width={Math.max(chartWidth, 300)}
                    height={chartHeight}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                      barPercentage: 0.5,
                    }}
                    style={{ borderRadius: 12, marginHorizontal: 4 }}
                    showValuesOnTopOfBars
                    flatColor={true}
                    fromZero
                    yAxisLabel=""
                    yAxisSuffix=""
                  />
                </ScrollView>
              </Card>
            )}
          </View>

          <View style={{ gap: 16, marginTop: 24 }}>
            <Text size="xl" className="font-bold">
              Hábitos Completados:
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              <View style={{ flex: 1, minWidth: "48%" }}>
                <Card className="p-4">
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <Icon
                      as={CheckCircleIcon}
                      size="md"
                      className="text-success-600"
                    />
                    <Text size="sm" className="font-semibold text-center">
                      Completados
                    </Text>
                    <View style={{ alignItems: "center" }}>
                      <Text size="xl" className="font-bold text-success-600">
                        {stats.completed}
                      </Text>
                      <Text
                        size="xs"
                        className="text-typography-500 text-center"
                      >
                        tarefas concluídas
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>

              <View style={{ flex: 1, minWidth: "48%" }}>
                <Card className="p-4">
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <Icon
                      as={TargetIcon}
                      size="md"
                      className="text-primary-500"
                    />
                    <Text size="sm" className="font-semibold text-center">
                      Taxa de Conclusão
                    </Text>
                    <View style={{ alignItems: "center" }}>
                      <Text size="xl" className="font-bold text-primary-500">
                        {stats.completionRate}%
                      </Text>
                      <Text
                        size="xs"
                        className="text-typography-500 text-center"
                      >
                        sucesso geral
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>
            </View>

            {hasActivityData && (
              <Card className="p-4" onLayout={onContainerLayout}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <Icon as={BarChart3Icon} size="md" className="text-primary" />
                  <Text size="lg" className="font-semibold">
                    Atividades Realizadas
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -4 }}
                >
                  <LineChart
                    data={activityChartData}
                    width={Math.max(chartWidth, 400)}
                    height={chartHeight}
                    chartConfig={chartConfig}
                    bezier
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withInnerLines={false}
                    withOuterLines={false}
                    style={{ borderRadius: 12, marginHorizontal: 4 }}
                    segments={4}
                  />
                </ScrollView>
              </Card>
            )}
          </View>

          <View style={{ gap: 16, marginTop: 24 }}>
            <Text size="xl" className="font-bold">
              Porcentagem de Sucesso %
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              <View style={{ flex: 1, minWidth: "48%" }}>
                <Card className="p-4">
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <Icon
                      as={TrendingUpIcon}
                      size="md"
                      className="text-success-600"
                    />
                    <Text size="sm" className="font-semibold text-center">
                      Melhor Dia
                    </Text>
                    <View style={{ alignItems: "center" }}>
                      <Text size="lg" className="font-bold text-success-600">
                        {formatDate(stats.bestDay.date)}
                      </Text>
                      <Text
                        size="sm"
                        className="text-success-500 font-semibold"
                      >
                        {stats.bestDay.rate}% sucesso
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>

              <View style={{ flex: 1, minWidth: "48%" }}>
                <Card className="p-4">
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <Icon
                      as={TrendingUpIcon}
                      size="md"
                      className="text-error-600"
                      style={{ transform: [{ rotate: "180deg" }] }}
                    />
                    <Text size="sm" className="font-semibold text-center">
                      Pior Dia
                    </Text>
                    <View style={{ alignItems: "center" }}>
                      <Text size="lg" className="font-bold text-error-600">
                        {formatDate(stats.worstDay.date)}
                      </Text>
                      <Text size="sm" className="text-error-500 font-semibold">
                        {stats.worstDay.rate}% sucesso
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>
            </View>

            {hasComparisonData && (
              <Card className="p-4" onLayout={onContainerLayout}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <Icon as={BarChart3Icon} size="md" className="text-primary" />
                  <Text size="lg" className="font-semibold">
                    Comparação de Sucesso por Frequência
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -4 }}
                >
                  <BarChart
                    data={comparisonChartData}
                    width={Math.max(chartWidth, 300)}
                    height={chartHeight}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
                      barPercentage: 0.5,
                    }}
                    style={{ borderRadius: 12, marginHorizontal: 4 }}
                    showValuesOnTopOfBars
                    flatColor={true}
                    fromZero
                    yAxisLabel=""
                    yAxisSuffix="%"
                  />
                </ScrollView>
              </Card>
            )}
          </View>

          <View style={{ gap: 16, marginTop: 24 }}>
            <Text size="xl" className="font-bold">
              Comparação de Atividades Realizadas:
            </Text>

            {hasActivitiesComparisonData && (
              <Card className="p-4" onLayout={onContainerLayout}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <Icon
                    as={GitCompareIcon}
                    size="md"
                    className="text-primary"
                  />
                  <Text size="lg" className="font-semibold">
                    Atividades por Frequência (
                    {activitiesComparisonChartData.labels.length} dias)
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -4 }}
                >
                  <LineChart
                    data={activitiesComparisonChartData}
                    width={Math.max(chartWidth, 350)}
                    height={chartHeight}
                    chartConfig={chartConfig}
                    bezier
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withInnerLines={false}
                    withOuterLines={false}
                    style={{ borderRadius: 12, marginHorizontal: 4 }}
                    segments={4}
                  />
                </ScrollView>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: 16,
                    marginTop: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: "rgba(0, 122, 255, 1)",
                        borderRadius: 6,
                      }}
                    />
                    <Text size="xs">Diário</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: "rgba(52, 199, 89, 1)",
                        borderRadius: 6,
                      }}
                    />
                    <Text size="xs">Semanal</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: "rgba(255, 149, 0, 1)",
                        borderRadius: 6,
                      }}
                    />
                    <Text size="xs">Mensal</Text>
                  </View>
                </View>
              </Card>
            )}
          </View>

          <View style={{ gap: 16, marginTop: 24 }}>
            <Text size="xl" className="font-bold">
              Maior Sequência:
            </Text>

            <Card className="p-6">
              <View style={{ alignItems: "center", gap: 16 }}>
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: "#007AFF20",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 4,
                    borderColor: "#007AFF",
                  }}
                >
                  <Text size="3xl" className="font-bold text-primary-500">
                    {stats.longestStreak}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text size="lg" className="font-semibold text-center">
                    {stats.longestStreak === 1
                      ? "Dia consecutivo"
                      : "Dias consecutivos"}
                  </Text>
                  <Text
                    size="sm"
                    className="text-typography-500 text-center mt-2"
                  >
                    Esta é sua maior sequência de hábitos completados sem
                    interrupção
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          <View style={{ gap: 12, marginTop: 24, marginBottom: 24 }}>
            <Text size="xl" className="font-bold">
              Detalhes por Hábito ({habits.length})
            </Text>

            {loading && !refreshing ? (
              <Card>
                <View style={{ paddingVertical: 32 }}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text className="text-center text-typography-500 mt-2">
                    Carregando hábitos...
                  </Text>
                </View>
              </Card>
            ) : habits.length === 0 ? (
              <Card>
                <View
                  style={{
                    paddingVertical: 32,
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <BarChart3Icon size={48} color="#999" />
                  <Text className="text-center text-typography-500">
                    {Object.keys(filters).length > 0
                      ? "Nenhum hábito encontrado com os filtros aplicados."
                      : "Nenhum hábito cadastrado ainda."}
                  </Text>
                  {Object.keys(filters).length > 0 && (
                    <TouchableOpacity
                      onPress={handleClearFilters}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        backgroundColor: "#007AFF",
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "white" }}>Limpar Filtros</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ) : (
              habits.map((habit) => {
                let totalCount = 30;

                if (filters.startDate && filters.endDate) {
                  const start = new Date(filters.startDate);
                  const end = new Date(filters.endDate);
                  const daysInPeriod =
                    Math.floor(
                      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                    ) + 1;

                  switch (habit.frequency) {
                    case "daily":
                      totalCount = daysInPeriod;
                      break;
                    case "weekly":
                      totalCount = Math.ceil(daysInPeriod / 7);
                      break;
                    case "monthly":
                      totalCount = Math.ceil(daysInPeriod / 30);
                      break;
                  }
                } else {
                  totalCount =
                    habit.frequency === "daily"
                      ? 30
                      : habit.frequency === "weekly"
                        ? 4
                        : 1;
                }

                const completedCount = habit.completions?.length || 0;

                return (
                  <HabitDetailCard
                    key={habit.id}
                    habit={habit}
                    completionRate={habit.completionRate}
                    completedCount={completedCount}
                    totalCount={totalCount}
                  />
                );
              })
            )}
          </View>
        </Box>
      </ScrollView>

      <FiltersActionSheet
        isOpen={showFilters}
        title="Filtrar Estatísticas"
        onClose={() => setShowFilters(false)}
        initialFilters={filters}
        tags={allTags}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </KeyboardAvoidingView>
  );
}
