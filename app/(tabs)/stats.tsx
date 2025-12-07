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
} from "react-native";
import { getAllHabits } from "@/api/habit";
import { getHabitStats } from "@/api/stat";
import { getAllTags } from "@/api/tag";
import { StatsFilters } from "@/components/stats/StatsFilters";
import { StatsCard } from "@/components/stats/StatsCard";
import { LineChart, BarChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

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

interface Filters {
  frequency?: HabitFrequency;
  startDate?: string;
  endDate?: string;
  tags?: string[];
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
  const [filters, setFilters] = React.useState<Filters>({});
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  
  const [activityChartData, setActivityChartData] = React.useState<ChartData>({
    labels: [],
    datasets: [{ data: [] }],
  });
  
  const [frequencyChartData, setFrequencyChartData] = React.useState<ChartData>({
    labels: ["Diário", "Semanal", "Mensal"],
    datasets: [{ data: [0, 0, 0] }],
  });
  
  const [comparisonChartData, setComparisonChartData] = React.useState<ChartData>({
    labels: ["Diário", "Semanal", "Mensal"],
    datasets: [{ data: [0, 0, 0] }],
  });

  const [activitiesComparisonChartData, setActivitiesComparisonChartData] = React.useState<ChartData>({
    labels: [],
    datasets: [
      { data: [], color: () => "rgba(0, 122, 255, 1)", strokeWidth: 2 },
      { data: [], color: () => "rgba(52, 199, 89, 1)", strokeWidth: 2 },
      { data: [], color: () => "rgba(255, 149, 0, 1)", strokeWidth: 2 },
    ],
  });
  
  const [dailyHabits, setDailyHabits] = React.useState<HabitWithCompletions[]>([]);
  const [weeklyHabits, setWeeklyHabits] = React.useState<HabitWithCompletions[]>([]);
  const [monthlyHabits, setMonthlyHabits] = React.useState<HabitWithCompletions[]>([]);

  const getCompletionDateString = (c: any): string | null => {
    if (!c) return null;
    
    const dateValue = c.date || c.completedAt || c.createdAt;
    if (!dateValue) return null;
    
    try {
      const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  const wasHabitCompletedOnDate = (habit: Habit, dateStr: string): boolean => {
    if (!habit.completions || !Array.isArray(habit.completions)) return false;
    
    return habit.completions.some(completion => {
      const completionDate = getCompletionDateString(completion);
      return completionDate === dateStr;
    });
  };

  const calculateLongestStreak = (habitsWithCompletions: HabitWithCompletions[]): number => {
    let longestStreak = 0;
    
    habitsWithCompletions.forEach((habit) => {
      const completionDates = habit.completions
        ?.map(c => getCompletionDateString(c))
        .filter((date): date is string => date !== null)
        .map(date => new Date(date))
        .filter(date => !isNaN(date.getTime()))
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

  const calculateCompletionStats = (habitsList: Habit[]) => {
    if (habitsList.length === 0) return { total: 0, completed: 0, rate: 0 };
    
    let totalOpportunities = 0;
    let completedCount = 0;
    
    habitsList.forEach(habit => {
      if (habit.completions && Array.isArray(habit.completions)) {
        totalOpportunities += 1;
        completedCount += habit.completions.length > 0 ? 1 : 0;
      }
    });
    
    const rate = habitsList.length > 0 ? 
      Math.round((completedCount / habitsList.length) * 100) : 0;
    
    return { total: habitsList.length, completed: completedCount, rate };
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      const tagsData = await getAllTags();
      setAllTags(tagsData || []);
      
      const allHabits = await getAllHabits();
      
      const dailyHabitsList = allHabits.filter(h => h.frequency === 'daily');
      const weeklyHabitsList = allHabits.filter(h => h.frequency === 'weekly');
      const monthlyHabitsList = allHabits.filter(h => h.frequency === 'monthly');
      
      let filteredHabits = [...allHabits];
      
      if (filters.frequency) {
        filteredHabits = filteredHabits.filter(h => h.frequency === filters.frequency);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filteredHabits = filteredHabits.filter(habit => {
          const habitTagNames = habit.tags?.map(t => t.name) || [];
          return filters.tags!.some(tagName => habitTagNames.includes(tagName));
        });
      }
      
      const habitsWithCompletions = filteredHabits.map((habit) => {
        const completions = habit.completions || [];
        const completionRate = completions.length > 0 ? 
          Math.min(Math.round((completions.length / 30) * 100), 100) : 0;
        
        return {
          ...habit,
          completions,
          completionRate,
        };
      });
      
      const dailyStats = calculateCompletionStats(dailyHabitsList);
      const weeklyStats = calculateCompletionStats(weeklyHabitsList);
      const monthlyStats = calculateCompletionStats(monthlyHabitsList);
      const allStats = calculateCompletionStats(filteredHabits);
      
      const longestStreak = calculateLongestStreak(habitsWithCompletions);
      const dailyActivityStats = calculateDailyActivityStats(habitsWithCompletions);
      
      setStats({
        total: allStats.total,
        completed: allStats.completed,
        pending: 0,
        notCompleted: allStats.total - allStats.completed,
        longestStreak,
        completionRate: allStats.rate,
        dailyCompletionRate: dailyStats.rate,
        weeklyCompletionRate: weeklyStats.rate,
        monthlyCompletionRate: monthlyStats.rate,
        bestDay: dailyActivityStats.bestDay,
        worstDay: dailyActivityStats.worstDay,
      });
      
      setHabits(habitsWithCompletions);
      setDailyHabits(dailyHabitsList.map(h => ({
        ...h,
        completions: h.completions || [],
        completionRate: calculateCompletionStats([h]).rate
      })));
      setWeeklyHabits(weeklyHabitsList.map(h => ({
        ...h,
        completions: h.completions || [],
        completionRate: calculateCompletionStats([h]).rate
      })));
      setMonthlyHabits(monthlyHabitsList.map(h => ({
        ...h,
        completions: h.completions || [],
        completionRate: calculateCompletionStats([h]).rate
      })));
      
      generateChartData(habitsWithCompletions, dailyHabitsList, weeklyHabitsList, monthlyHabitsList);
      
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as estatísticas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  const calculateDailyActivityStats = (habitsWithCompletions: HabitWithCompletions[]) => {
    const activitiesMap: Record<string, { completed: number, total: number }> = {};
    
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split("T")[0];
    });
    
    last30Days.forEach(date => {
      activitiesMap[date] = { completed: 0, total: 0 };
    });
    
    habitsWithCompletions.forEach(habit => {
      last30Days.forEach(date => {
        activitiesMap[date].total++;
        
        if (wasHabitCompletedOnDate(habit, date)) {
          activitiesMap[date].completed++;
        }
      });
    });
    
    const activities = last30Days.map(date => {
      const data = activitiesMap[date];
      const successRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
      
      return {
        date,
        completed: data.completed,
        total: data.total,
        successRate,
      };
    });
    
    let bestDay = { date: "", rate: 0 };
    let worstDay = { date: "", rate: 100 };
    
    activities.forEach(activity => {
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
    monthlyHabits: Habit[]
  ) => {
    const last15Days = Array.from({ length: 15 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (14 - i));
      return date.toISOString().split("T")[0];
    });
    
    const dailyCompletions = last15Days.map(date => {
      return allHabits.reduce((total, habit) => {
        if (wasHabitCompletedOnDate(habit, date)) {
          return total + 1;
        }
        return total;
      }, 0);
    });
    
    const labels = last15Days.map((date, index) => {
      if (index % 3 === 0 || index === 14) {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }
      return "";
    });
    
    setActivityChartData({
      labels,
      datasets: [{
        data: dailyCompletions,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 3,
      }],
    });
    
    const dailyCompleted = dailyHabits.reduce((sum, habit) => 
      sum + (habit.completions || []).length, 0
    );
    const weeklyCompleted = weeklyHabits.reduce((sum, habit) => 
      sum + (habit.completions || []).length, 0
    );
    const monthlyCompleted = monthlyHabits.reduce((sum, habit) => 
      sum + (habit.completions || []).length, 0
    );
    
    setFrequencyChartData({
      labels: ["Diário", "Semanal", "Mensal"],
      datasets: [{
        data: [dailyCompleted, weeklyCompleted, monthlyCompleted],
        color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
        strokeWidth: 2,
      }],
    });
    
    const dailyStats = calculateCompletionStats(dailyHabits);
    const weeklyStats = calculateCompletionStats(weeklyHabits);
    const monthlyStats = calculateCompletionStats(monthlyHabits);
    
    setComparisonChartData({
      labels: ["Diário", "Semanal", "Mensal"],
      datasets: [{
        data: [dailyStats.rate, weeklyStats.rate, monthlyStats.rate],
        color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
        strokeWidth: 2,
      }],
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });
    
    const comparisonLabels = last7Days.map((date, index) => {
      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      return dayNames[date.getDay()];
    });
    
    const dailyData = last7Days.map(date => {
      const dateStr = date.toISOString().split("T")[0];
      return dailyHabits.reduce((total, habit) => 
        total + (wasHabitCompletedOnDate(habit, dateStr) ? 1 : 0), 0
      );
    });
    
    const weeklyData = last7Days.map(date => {
      const dateStr = date.toISOString().split("T")[0];
      return weeklyHabits.reduce((total, habit) => 
        total + (wasHabitCompletedOnDate(habit, dateStr) ? 1 : 0), 0
      );
    });
    
    const monthlyData = last7Days.map(date => {
      const dateStr = date.toISOString().split("T")[0];
      return monthlyHabits.reduce((total, habit) => 
        total + (wasHabitCompletedOnDate(habit, dateStr) ? 1 : 0), 0
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
    setFilters({});
    setShowFilters(false);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const HeaderRight = () => {
    const hasActiveFilters = filters.frequency || filters.startDate || filters.endDate || (filters.tags && filters.tags.length > 0);
    
    return (
      <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
        {hasActiveFilters && (
          <TouchableOpacity
            onPress={handleClearFilters}
            style={{
              marginRight: 12,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: "#FF3B30",
              borderRadius: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <XIcon size={16} color="white" />
            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
              Limpar
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: "#007AFF",
            borderRadius: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <FilterIcon size={16} color="white" />
          <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
            Filtrar
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const HeaderLeft = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        marginLeft: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      <ArrowLeftIcon size={20} color="#007AFF" />
      <Text style={{ color: "#007AFF", fontWeight: "600", fontSize: 14 }}>
        Voltar
      </Text>
    </TouchableOpacity>
  );

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
    propsForLabels: { fontSize: 10 },
    fillShadowGradientFrom: "#007AFF",
    fillShadowGradientTo: "rgba(0, 122, 255, 0.1)",
  };
  
  const chartWidth = Math.min(screenWidth - 32, 400);
  const chartHeight = 180;
  
  const hasActivityData = activityChartData.datasets[0]?.data?.some(val => val > 0) || false;
  const hasFrequencyData = frequencyChartData.datasets[0]?.data?.some(val => val > 0) || false;
  const hasComparisonData = comparisonChartData.datasets[0]?.data?.some(val => val > 0) || false;
  const hasActivitiesComparisonData = activitiesComparisonChartData.datasets.some(
    dataset => dataset.data?.some(val => val > 0)
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Estatísticas",
          headerLeft: HeaderLeft,
          headerRight: HeaderRight,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        >
          {loading && !refreshing && (
            <View style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={{ marginTop: 12, color: "#666" }}>
                Carregando estatísticas...
              </Text>
            </View>
          )}

          <View style={{ padding: 16 }}>
            <StatsCard
              title="Estatísticas"
              stats={stats}
              showCompletionRate
            />

            <View style={{ gap: 16, marginTop: 24 }}>
              <Text size="xl" className="font-bold">
                 Por Frequência
              </Text>
              
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                <View style={{ flex: 1, minWidth: "30%" }}>
                  <Card className="p-4 bg-blue-50">
                    <View style={{ alignItems: "center", gap: 8 }}>
                      <Icon as={CalendarIcon} size="md" className="text-blue-600" />
                      <Text size="sm" className="font-semibold text-center text-blue-700">
                        Diário
                      </Text>
                      <View style={{ alignItems: "center" }}>
                        <Text size="xl" className="font-bold text-blue-600">
                          {dailyHabits.length}
                        </Text>
                        <Text size="xs" className="text-blue-500 text-center">
                          hábitos
                        </Text>
                        <Text size="sm" className="font-semibold text-blue-600 mt-2">
                          {stats.dailyCompletionRate}% sucesso
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>
                
                <View style={{ flex: 1, minWidth: "30%" }}>
                  <Card className="p-4 bg-green-50">
                    <View style={{ alignItems: "center", gap: 8 }}>
                      <Icon as={CalendarIcon} size="md" className="text-green-600" />
                      <Text size="sm" className="font-semibold text-center text-green-700">
                        Semanal
                      </Text>
                      <View style={{ alignItems: "center" }}>
                        <Text size="xl" className="font-bold text-green-600">
                          {weeklyHabits.length}
                        </Text>
                        <Text size="xs" className="text-green-500 text-center">
                          hábitos
                        </Text>
                        <Text size="sm" className="font-semibold text-green-600 mt-2">
                          {stats.weeklyCompletionRate}% sucesso
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>
                
                <View style={{ flex: 1, minWidth: "30%" }}>
                  <Card className="p-4 bg-purple-50">
                    <View style={{ alignItems: "center", gap: 8 }}>
                      <Icon as={CalendarIcon} size="md" className="text-purple-600" />
                      <Text size="sm" className="font-semibold text-center text-purple-700">
                        Mensal
                      </Text>
                      <View style={{ alignItems: "center" }}>
                        <Text size="xl" className="font-bold text-purple-600">
                          {monthlyHabits.length}
                        </Text>
                        <Text size="xs" className="text-purple-500 text-center">
                          hábitos
                        </Text>
                        <Text size="sm" className="font-semibold text-purple-600 mt-2">
                          {stats.monthlyCompletionRate}% sucesso
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>
              </View>
              
              {hasFrequencyData && (
                <Card className="p-4">
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <Icon as={BarChartIcon} size="md" className="text-primary" />
                    <Text size="lg" className="font-semibold">
                      Hábitos Completados por Frequência
                    </Text>
                  </View>
                  <BarChart
                    data={frequencyChartData}
                    width={chartWidth}
                    height={chartHeight}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                      barPercentage: 0.5,
                    }}
                    style={{ borderRadius: 12 }}
                    showValuesOnTopOfBars
                    flatColor={true}
                    fromZero
                    yAxisLabel=""
                    yAxisSuffix=""
                  />
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
                      <Icon as={CheckCircleIcon} size="md" className="text-green-600" />
                      <Text size="sm" className="font-semibold text-center">
                        Completados
                      </Text>
                      <View style={{ alignItems: "center" }}>
                        <Text size="xl" className="font-bold text-green-600">
                          {stats.completed}
                        </Text>
                        <Text size="xs" className="text-muted-foreground text-center">
                          tarefas concluídas
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>
                
                <View style={{ flex: 1, minWidth: "48%" }}>
                  <Card className="p-4">
                    <View style={{ alignItems: "center", gap: 8 }}>
                      <Icon as={TargetIcon} size="md" className="text-primary" />
                      <Text size="sm" className="font-semibold text-center">
                        Taxa de Conclusão
                      </Text>
                      <View style={{ alignItems: "center" }}>
                        <Text size="xl" className="font-bold text-primary">
                          {stats.completionRate}%
                        </Text>
                        <Text size="xs" className="text-muted-foreground text-center">
                          sucesso geral
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>
              </View>
              
              {hasActivityData && (
                <Card className="p-4">
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <Icon as={BarChart3Icon} size="md" className="text-primary" />
                    <Text size="lg" className="font-semibold">
                      Atividades Realizadas (15 dias)
                    </Text>
                  </View>
                  <LineChart
                    data={activityChartData}
                    width={chartWidth}
                    height={chartHeight}
                    chartConfig={chartConfig}
                    bezier
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withInnerLines={false}
                    withOuterLines={false}
                    style={{ borderRadius: 12 }}
                    segments={4}
                  />
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
                      <Icon as={TrendingUpIcon} size="md" className="text-green-600" />
                      <Text size="sm" className="font-semibold text-center">
                        Melhor Dia
                      </Text>
                      <View style={{ alignItems: "center" }}>
                        <Text size="lg" className="font-bold text-green-600">
                          {formatDate(stats.bestDay.date)}
                        </Text>
                        <Text size="sm" className="text-green-500 font-semibold">
                          {stats.bestDay.rate}% sucesso
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>
                
                <View style={{ flex: 1, minWidth: "48%" }}>
                  <Card className="p-4">
                    <View style={{ alignItems: "center", gap: 8 }}>
                      <Icon as={TrendingUpIcon} size="md" className="text-red-600" style={{ transform: [{ rotate: '180deg' }] }} />
                      <Text size="sm" className="font-semibold text-center">
                        Pior Dia
                      </Text>
                      <View style={{ alignItems: "center" }}>
                        <Text size="lg" className="font-bold text-red-600">
                          {formatDate(stats.worstDay.date)}
                        </Text>
                        <Text size="sm" className="text-red-500 font-semibold">
                          {stats.worstDay.rate}% sucesso
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>
              </View>
              
              {hasComparisonData && (
                <Card className="p-4">
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <Icon as={BarChart3Icon} size="md" className="text-primary" />
                    <Text size="lg" className="font-semibold">
                      Comparação de Sucesso por Frequência
                    </Text>
                  </View>
                  <BarChart
                    data={comparisonChartData}
                    width={chartWidth}
                    height={chartHeight}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
                      barPercentage: 0.5,
                    }}
                    style={{ borderRadius: 12 }}
                    showValuesOnTopOfBars
                    flatColor={true}
                    fromZero
                    yAxisLabel=""
                    yAxisSuffix="%"
                  />
                </Card>
              )}
            </View>

            <View style={{ gap: 16, marginTop: 24 }}>
              <Text size="xl" className="font-bold">
                 Comparação de Atividades Realizadas:
              </Text>
              
              {hasActivitiesComparisonData && (
                <Card className="p-4">
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Icon as={GitCompareIcon} size="md" className="text-primary" />
                    <Text size="lg" className="font-semibold">
                      Atividades por Frequência (7 dias)
                    </Text>
                  </View>
                  <LineChart
                    data={activitiesComparisonChartData}
                    width={chartWidth}
                    height={chartHeight}
                    chartConfig={chartConfig}
                    bezier
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withInnerLines={false}
                    withOuterLines={false}
                    style={{ borderRadius: 12 }}
                    segments={4}
                  />
                  <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <View style={{ width: 12, height: 12, backgroundColor: "rgba(0, 122, 255, 1)", borderRadius: 6 }} />
                      <Text size="xs">Diário</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <View style={{ width: 12, height: 12, backgroundColor: "rgba(52, 199, 89, 1)", borderRadius: 6 }} />
                      <Text size="xs">Semanal</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <View style={{ width: 12, height: 12, backgroundColor: "rgba(255, 149, 0, 1)", borderRadius: 6 }} />
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
                  <View style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: "#007AFF20",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 4,
                    borderColor: "#007AFF",
                  }}>
                    <Text size="3xl" className="font-bold text-primary">
                      {stats.longestStreak}
                    </Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text size="lg" className="font-semibold text-center">
                      {stats.longestStreak === 1 ? "Dia consecutivo" : "Dias consecutivos"}
                    </Text>
                    <Text size="sm" className="text-muted-foreground text-center mt-2">
                      Esta é sua maior sequência de hábitos completados sem interrupção
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
                    <Text className="text-center text-muted-foreground mt-2">
                      Carregando hábitos...
                    </Text>
                  </View>
                </Card>
              ) : habits.length === 0 ? (
                <Card>
                  <View style={{ paddingVertical: 32, alignItems: "center", gap: 12 }}>
                    <BarChart3Icon size={48} color="#999" />
                    <Text className="text-center text-muted-foreground">
                      {Object.keys(filters).length > 0 
                        ? "Nenhum hábito encontrado com os filtros aplicados."
                        : "Nenhum hábito cadastrado ainda."}
                    </Text>
                    {Object.keys(filters).length > 0 && (
                      <TouchableOpacity 
                        onPress={handleClearFilters}
                        style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#007AFF", borderRadius: 6 }}
                      >
                        <Text style={{ color: "white" }}>Limpar Filtros</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              ) : (
                habits.map((habit) => {
                  const completedCount = habit.completions?.length || 0;
                  const totalCount = 30;
                  
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
          </View>
        </ScrollView>

        <Modal 
          visible={showFilters} 
          animationType="slide" 
          transparent={true}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" }}>
            <View style={{ 
              backgroundColor: "white", 
              borderTopLeftRadius: 20, 
              borderTopRightRadius: 20, 
              padding: 20,
              maxHeight: "80%",
              minHeight: 400 
            }}>
              <View style={{ 
                flexDirection: "row", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#f0f0f0"
              }}>
                <Text size="xl" className="font-bold">
                  Filtrar Estatísticas
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowFilters(false)} 
                  style={{ padding: 4 }}
                >
                  <XIcon size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <StatsFilters 
                filters={filters}
                onFiltersChange={handleApplyFilters}
                tags={allTags}
                onApply={() => setShowFilters(false)}
                onClear={handleClearFilters}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}