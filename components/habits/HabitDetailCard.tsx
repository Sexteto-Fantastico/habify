import { Card } from "@/components/ui/card";
import { TagBadge } from "@/components/tags/TagBadge";
import { Habit } from "@/lib/types";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { FrequencyLabel } from "@/constants/frequency-labels";
import { HStack } from "../ui/hstack";
import { VStack } from "../ui/vstack";

interface HabitDetailCardProps {
  habit: Habit;
  completionRate?: number;
  completedCount?: number;
  totalCount?: number;
}

export function HabitDetailCard({
  habit,
  completionRate,
  completedCount,
  totalCount,
}: HabitDetailCardProps) {
  const rate = completionRate ?? 0;
  const completed = completedCount ?? 0;
  const total = totalCount ?? 0;

  return (
    <Card>
      <HStack className="justify-between items-center pb-2">
        <VStack>
          <Text size="xl">{habit.name}</Text>
          {habit.description && (
            <Text className="text-typography-600">{habit.description}</Text>
          )}
        </VStack>
        <HStack className="items-center gap-2">
          <Text size="sm">{FrequencyLabel[habit.frequency]}</Text>
        </HStack>
      </HStack>
      <View className="gap-3">
        {habit.tags && habit.tags.length > 0 && (
          <View className="flex-row flex-wrap items-center gap-2">
            {habit.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </View>
        )}

        {total > 0 && (
          <View className="border-t border-outline-100 pt-2">
            <View className="mb-2 flex-row items-center justify-between">
              <Text size="sm">Conclusão</Text>
              <Text size="sm" className="font-semibold">
                {rate}%
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-background-100">
              <View
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${rate}%` }}
              />
            </View>
            <Text size="sm" className="mt-1">
              Número de vezes em que o Hábito foi concluído: {completed}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
