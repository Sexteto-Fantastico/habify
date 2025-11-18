import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { TagBadge } from "@/components/tags/TagBadge";
import { Habit } from "@/lib/types";
import { CalendarIcon, TagIcon } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { FREQUENCY_LABELS } from "@/constants/frequency-labels";

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
      <View>
        <Text>{habit.name}</Text>
        {habit.description && <Text>{habit.description}</Text>}
      </View>
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Icon as={CalendarIcon} />
          <Text size="sm">{FREQUENCY_LABELS[habit.frequency]}</Text>
        </View>

        {habit.tags && habit.tags.length > 0 && (
          <View className="flex-row flex-wrap items-center gap-2">
            <Icon as={TagIcon} />
            {habit.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </View>
        )}

        {total > 0 && (
          <View className="border-t border-border pt-2">
            <View className="mb-2 flex-row items-center justify-between">
              <Text size="sm">Taxa de Conclusão</Text>
              <Text size="sm" className="font-semibold">
                {rate}%
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-muted">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${rate}%` }}
              />
            </View>
            <Text size="sm" className="mt-1">
              {completed} de {total} completos
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
