import React, { useEffect, useState } from "react";
import { getAllHabits, markHabitCompletion } from "@/api/habit";
import { Habit } from "@/lib/types";
import { HabitCard } from "@/components/habits/HabitCard";
import { View, ScrollView, Alert as RNAlert, Platform, TextInput } from "react-native";
import { Text } from "@/components/ui/text";
import { formatDate } from "@/lib/date";
import { Heading } from "@/components/ui/heading";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Alert as UIAlert, AlertText } from "@/components/ui/alert";

export default function ListHabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const isoDateOnly = (d: Date) => d.toISOString().split("T")[0];

  const formatDateToBRL = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };
  const formatBRLToISO = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  // initial text values (DD/MM/YYYY)
  const initialStartText = firstOfMonth.toLocaleDateString("pt-BR");
  const initialEndText = today.toLocaleDateString("pt-BR");

  // text state (masked)
  const [startText, setStartText] = useState<string>(initialStartText);
  const [endText, setEndText] = useState<string>(initialEndText);

  const [invalidAlert, setInvalidAlert] = useState<string | null>(null);

  const maskBRL = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8); // ddmmyyyy max
    if (digits.length === 0) return "";
    const parts = [];
    if (digits.length <= 2) parts.push(digits);
    else if (digits.length <= 4) parts.push(digits.slice(0, 2), digits.slice(2));
    else parts.push(digits.slice(0, 2), digits.slice(2, 4), digits.slice(4));
    return parts.join("/");
  };

  const brlIsValid = (brl: string) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(brl)) return false;
    const [d, m, y] = brl.split("/").map(Number);
    if (m < 1 || m > 12) return false;
    if (d < 1) return false;
    
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d > daysInMonth) return false;
    return true;
  };

  const fetchHabits = async (startBr?: string | undefined, endBr?: string | undefined) => {
    setLoading(true);
    try {
     
      const startBR = startBr === undefined ? startText : startBr;
      const endBR = endBr === undefined ? endText : endBr;

      const startISO = startBR && brlIsValid(startBR) ? formatBRLToISO(startBR) : undefined;
      const endISO = endBR && brlIsValid(endBR) ? formatBRLToISO(endBR) : undefined;

      const endWithTime = endISO ? `${endISO}T23:59:00` : undefined;
      
      const data = await getAllHabits(startISO, endWithTime);
      setHabits(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch uses current text state
    fetchHabits();
  }, []);

  const handleToggleCompletion = async (habitId: number) => {
    try {
      await markHabitCompletion(habitId, new Date().toISOString().split("T")[0]);
      await fetchHabits(startText, endText);

    } catch (error) {
      console.error("Erro ao marcar conclusão do hábito:", error);
      RNAlert.alert("Erro", "Não foi possível marcar a conclusão do hábito");
    }
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

  const sortedDates = Object.keys(groupedHabits).sort((a, b) => b.localeCompare(a));

  const completedPerDay = (dayHabits: Habit[]) =>
    dayHabits.filter((habit) => habit.completions?.length > 0).length;

  const totalCompleted = habits.filter((habit) => habit.completions?.length > 0).length;

  // Called when user presses Filtrar
  const onPressFilter = () => {
    // If both blank -> ok (no filters)
    const startBlank = startText.replace(/\D/g, "").length === 0;
    const endBlank = endText.replace(/\D/g, "").length === 0;

    // Validate each non-blank value
    if (!startBlank && !brlIsValid(startText)) {
      setInvalidAlert("Data de início inválida. Voltando ao padrão.");
      setStartText(initialStartText);
      // hide after 3.5s
      setTimeout(() => setInvalidAlert(null), 3500);
      // fetch with default start (initialStartText) and current end (if valid or blank)
      fetchHabits(initialStartText, endBlank ? undefined : endText);
      return;
    }

    if (!endBlank && !brlIsValid(endText)) {
      setInvalidAlert("Data fim inválida. Voltando ao padrão.");
      setEndText(initialEndText);
      setTimeout(() => setInvalidAlert(null), 3500);
      fetchHabits(startBlank ? undefined : startText, initialEndText);
      return;
    }

    // both valid or blank -> proceed
    fetchHabits(startBlank ? undefined : startText, endBlank ? undefined : endText);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      <ScrollView showsVerticalScrollIndicator={false} className="pb-32 p-4">
        <VStack space="sm" className="px-4 py-4">
          <Heading size="2xl">Meus Hábitos</Heading>
          <Text className="text-base text-typography-500">Acompanhe seus hábitos diários</Text>
        </VStack>

        {/* Total Summary */}
        {!loading && habits.length > 0 && (
          <View className="px-6 mb-6 flex-row items-center justify-around bg-primary/10 dark:bg-primary/20 rounded-xl p-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary text-typography-900 dark:text-white">
                {totalCompleted}
              </Text>
              <Text className="text-sm text-muted text-typography-500 dark:text-slate-400">Completados</Text>
            </View>
            <View className="w-px h-12 bg-primary/20 dark:bg-primary/30" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary text-typography-900 dark:text-white">{habits.length}</Text>
              <Text className="text-sm text-muted text-typography-500 dark:text-slate-400">Total</Text>
            </View>
            <View className="w-px h-12 bg-primary/20 dark:bg-primary/30" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary text-typography-900 dark:text-white">
                {habits.length ? Math.round((totalCompleted / habits.length) * 100) : 0}%
              </Text>
              <Text className="text-sm text-muted text-typography-500 dark:text-slate-400">Taxa</Text>
            </View>
          </View>
        )}

        {/* Date filters */}
        <View className="px-6 mb-4">
          <View className="flex-row items-end space-x-3">
            <View className="flex-1">
              <Text className="text-xs text-typography-500 mb-1">Início</Text>
              <TextInput
                value={startText}
                onChangeText={(t) => setStartText(maskBRL(t))}
                keyboardType="numeric"
                maxLength={10}
                placeholder="DD/MM/YYYY"
                className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-sm text-foreground text-typography-900 dark:text-white"
              />
            </View>

            <View className="flex-1">
              <Text className="text-xs text-typography-500 mb-1">Fim</Text>
              <TextInput
                value={endText}
                onChangeText={(t) => setEndText(maskBRL(t))}
                keyboardType="numeric"
                maxLength={10}
                placeholder="DD/MM/YYYY"
                className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-sm text-foreground text-typography-900 dark:text-white"
              />
            </View>

            <Button onPress={onPressFilter} variant="solid" className="h-10 px-6">
              <ButtonText>Filtrar</ButtonText>
            </Button>
          </View>

          
        </View>
        
        {/* show UI alert when invalid */}
        {invalidAlert && (
          <View className="px-6 mb-4">
            <UIAlert action="error" variant="solid">
              <AlertText className="text-sm">{invalidAlert}</AlertText>
            </UIAlert>
          </View>
        )}

        {loading ? (
          <Text className="text-center mt-8 text-foreground dark:text-slate-300">Carregando...</Text>
        ) : habits.length === 0 ? (
          <Card>
            <Text className="text-center text-typography-500">Sem hábitos ainda.</Text>
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
                <View key={date} className="text-typography-900 bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md">
                  {/* Date Header */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center space-x-3 flex-1">
                      <View className="w-6 h-6 bg-primary dark:bg-primary rounded items-center justify-center">
                        <Text className="text-white text-xs font-bold">📅</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground dark:text-white">{formatDate(date)}</Text>
                        <Text className="text-xs text-muted dark:text-slate-400">
                          {groupedHabits[date].length} {groupedHabits[date].length === 1 ? "item" : "itens"}
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
                      <View key={habit.id} className="border-l-4 border-primary dark:border-primary pl-4 py-2">
                        <HabitCard habit={habit} onToggleCompletion={handleToggleCompletion} />
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