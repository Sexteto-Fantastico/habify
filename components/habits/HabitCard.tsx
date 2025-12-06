import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { TagBadge } from "@/components/tags/TagBadge";
import { Habit } from "@/lib/types";
import { CheckIcon, ClockIcon } from "lucide-react-native";
import { View } from "react-native";
import { Button, ButtonIcon } from "../ui/button";
import { Text } from "../ui/text";
import { formatDate } from "@/lib/date";
import { VStack } from "../ui/vstack";
import { Box } from "../ui/box";
import React from "react";

interface HabitCardProps {
  habit: Habit;
  onToggleCompletion: (habitId: number) => void;
}

export function HabitCard({ habit, onToggleCompletion }: HabitCardProps) {
  return (
    <Card>
      <Box className="mb-2 flex-row items-center justify-between">
        <Box className="flex-1 flex-col gap-2">
          <Text size="lg">{habit.name}</Text>
          {habit.description && (
            <Text className="text-typography-600">{habit.description}</Text>
          )}
        </Box>

        <Button
          variant="solid"
          action="positive"
          size="sm"
          onPress={() => onToggleCompletion(habit.id)}
        >
          <ButtonIcon as={CheckIcon} />
        </Button>
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
