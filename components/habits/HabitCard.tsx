import { Card } from "@/components/ui/card";
import { TagBadge } from "@/components/tags/TagBadge";
import { Habit } from "@/lib/types";
import { CheckIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "../ui/text";

import { VStack } from "../ui/vstack";
import { Box } from "../ui/box";
import { getLocalDateString } from "@/lib/utils";
import React from "react";

interface HabitCardProps {
  habit: Habit;
  onToggleCompletion: (habitId: number) => void;
  date: Date;
}

export function HabitCard({ habit, onToggleCompletion, date }: HabitCardProps) {
  const isCompletedToday = () => {
    // Normaliza a data alvo para formato ISO (YYYY-MM-DD)
    const targetDateObj = date instanceof Date ? date : new Date(date);
    const targetDateISO = targetDateObj.toISOString().split("T")[0];
    const targetDate = getLocalDateString(targetDateObj);

    if (habit.concludedDays && Array.isArray(habit.concludedDays)) {
      // @ts-ignore
      return (
        habit.concludedDays.includes(targetDate) ||
        habit.concludedDays.includes(targetDateISO)
      );
    }

    if (
      habit.completions &&
      Array.isArray(habit.completions) &&
      habit.completions.length > 0
    ) {
      return habit.completions.some((completion: any) => {
        // Se completion é um objeto com propriedade date
        if (typeof completion === "object" && completion !== null) {
          // Se tem propriedade date
          if (completion.date !== undefined && completion.date !== null) {
            let completionDateStr: string | null = null;

            // Se date é um objeto Date
            if (completion.date instanceof Date) {
              completionDateStr = completion.date.toISOString().split("T")[0];
            }
            // Se date é uma string
            else if (typeof completion.date === "string") {
              completionDateStr = completion.date.split("T")[0]; // Pega apenas a parte da data
            }
            // Se date é um objeto com propriedades de data (pode vir da API como objeto)
            else if (typeof completion.date === "object") {
              try {
                // Tenta converter para Date
                const dateObj = new Date(completion.date);
                if (!isNaN(dateObj.getTime())) {
                  completionDateStr = dateObj.toISOString().split("T")[0];
                }
              } catch {
                // Ignora erros de conversão
              }
            }

            if (completionDateStr) {
              return (
                completionDateStr === targetDateISO ||
                completionDateStr === targetDate
              );
            }
          }

          // Se tem propriedade completedAt (pode existir em algumas estruturas)
          if (
            completion.completedAt !== undefined &&
            completion.completedAt !== null
          ) {
            let completionDateStr: string | null = null;

            if (completion.completedAt instanceof Date) {
              completionDateStr = completion.completedAt
                .toISOString()
                .split("T")[0];
            } else if (typeof completion.completedAt === "string") {
              completionDateStr = completion.completedAt.split("T")[0];
            } else if (typeof completion.completedAt === "object") {
              try {
                const dateObj = new Date(completion.completedAt);
                if (!isNaN(dateObj.getTime())) {
                  completionDateStr = dateObj.toISOString().split("T")[0];
                }
              } catch {
                // Ignora erros de conversão
              }
            }

            if (completionDateStr) {
              return (
                completionDateStr === targetDateISO ||
                completionDateStr === targetDate
              );
            }
          }
        }

        // Se completion é uma string diretamente
        if (typeof completion === "string") {
          const completionDateStr = completion.split("T")[0];
          return (
            completionDateStr === targetDateISO ||
            completionDateStr === targetDate
          );
        }

        return false;
      });
    }

    return false;
  };

  const isCompleted = isCompletedToday();

  return (
    <Card>
      <Box className="mb-2 flex-row items-center justify-between">
        <Box className="flex-1 flex-col gap-2">
          <Text size="lg">{habit.name}</Text>
          {habit.description && (
            <Text className="text-typography-600">{habit.description}</Text>
          )}
        </Box>

        <Pressable
          onPress={() => onToggleCompletion(habit.id)}
          className={`
            w-7 h-7 rounded-full border-2 items-center justify-center
            ${
              isCompleted
                ? "border-green-500 bg-green-500"
                : "border-typography-300 bg-white dark:bg-gray-800"
            }
            active:opacity-80
          `}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isCompleted ? (
            <CheckIcon size={16} color="white" strokeWidth={3} />
          ) : (
            <View className="w-3 h-3 rounded-full bg-transparent" />
          )}
        </Pressable>
      </Box>

      <VStack>
        {habit.tags && habit.tags.length > 0 && (
          <View className="mt-1 flex-row flex-wrap gap-1">
            {habit.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </View>
        )}
      </VStack>
    </Card>
  );
}
