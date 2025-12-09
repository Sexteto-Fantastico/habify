import { Card } from "@/components/ui/card";
import { TagBadge } from "@/components/tags/TagBadge";
import { Habit } from "@/lib/types";
import { CheckIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "../ui/text";
import { formatDate } from "@/lib/date";
import { VStack } from "../ui/vstack";
import { Box } from "../ui/box";
import React from "react";

interface HabitCardProps {
  habit: Habit;
  onToggleCompletion: (habitId: number) => void;
  date?: Date | null;
}

export function HabitCard({ habit, onToggleCompletion, date }: HabitCardProps) {
  const isCompletedToday = () => {
    const today = date ? date : new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD


    if (habit.concludedDays && Array.isArray(habit.concludedDays)) {
      // @ts-ignore
      return habit.concludedDays.includes(today);
    }


    if (habit.completions && Array.isArray(habit.completions)) {
      return habit.completions.some(completion => {

        if (typeof completion === 'object' && completion.date) {
          return completion.date === today;
        }

        if (typeof completion === 'string') {
          return completion === today;
        }
        return false;
      });
    }

    return false;
  };

  const isCompleted = isCompletedToday();
  console.log(isCompleted);

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
            ${isCompleted
            ? "border-green-500 bg-green-500"
            : "border-typography-300 bg-white dark:bg-gray-800"
          }
            active:opacity-80
          `}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isCompleted ? (
            <CheckIcon
              size={16}
              color="white"
              strokeWidth={3}
            />
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
