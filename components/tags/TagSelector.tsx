import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Tag } from "@/lib/types";
import { useRouter } from "expo-router";
import { View, Pressable } from "react-native";

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: number[];
  onToggle: (tagId: number) => void;
  showManageButton?: boolean;
}

export function TagSelector({
  tags,
  selectedTagIds,
  onToggle,
}: TagSelectorProps) {
  const router = useRouter();

  if (tags.length === 0) {
    return (
      <View className="rounded-md border border-dashed border-border p-4">
        <Text className="text-center">Nenhuma tag disponível</Text>
        <Text
          className="text-center text-sm text-primary underline"
          onPress={() => router.push("/(tabs)/tags")}
        >
          Crie sua primeira tag
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text size="sm">Tags</Text>
        <Button variant="link" size="sm">
          <ButtonText size="sm">Gerenciar tags</ButtonText>
        </Button>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <Pressable
              key={tag.id}
              onPress={() => onToggle(tag.id)}
              className={`rounded-full border-2 px-3 py-1.5 ${
                isSelected
                  ? "border-foreground bg-muted"
                  : "border-border bg-background"
              }`}
            >
              <View className="flex-row items-center gap-2">
                <View
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <Text size="sm">{tag.name}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
