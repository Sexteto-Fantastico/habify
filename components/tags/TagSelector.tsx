import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Tag } from "@/lib/types";
import { useRouter } from "expo-router";

import { Pressable } from "../ui/pressable";
import { Box } from "../ui/box";
import { cn } from "@/lib/utils";

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
      <Box className="rounded-md border border-dashed border-border p-4">
        <Text className="text-center">Nenhuma tag disponível</Text>
        <Button variant="link" size="sm" onPress={() => router.push("/tags")}>
          <ButtonText size="sm">Crie sua primeira</ButtonText>
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="flex-row items-center justify-between">
        <Text size="sm">Tags</Text>
        <Button variant="link" size="sm" onPress={() => router.push("/tags")}>
          <ButtonText size="sm">Gerenciar tags</ButtonText>
        </Button>
      </Box>
      <Box className="flex-row flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <Pressable
              key={tag.id}
              onPress={() => onToggle(tag.id)}
              className={cn(
                "rounded-full border-2 px-3 py-1.5",
                isSelected ? "border-primary-500" : "border-border",
              )}
            >
              <Box className="flex-row items-center gap-2">
                <Box
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <Text size="sm">{tag.name}</Text>
              </Box>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );
}
