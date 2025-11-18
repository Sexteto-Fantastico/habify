import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { TagBadge } from "@/components/tags/TagBadge";
import { Habit } from "@/lib/types";
import { CheckIcon } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

interface HabitCardProps {
  habit: Habit;
  onToggleCompletion: (habitId: number) => void;
}

export function HabitCard({ habit, onToggleCompletion }: HabitCardProps) {
  return (
    <Card>
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-1 flex-col gap-2">
          <Text size="lg">{habit.name}</Text>
          {habit.description && <Text className="">{habit.description}</Text>}
        </View>
        <Button
          variant="outline"
          size="sm"
          onPress={() => onToggleCompletion(habit.id)}
        >
          <Icon as={CheckIcon} size="lg" />
        </Button>
      </View>
      <View>
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-2">
            {habit.tags && habit.tags.length > 0 && (
              <View className="mt-1 flex-row flex-wrap gap-1">
                {habit.tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} size="sm" />
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}
