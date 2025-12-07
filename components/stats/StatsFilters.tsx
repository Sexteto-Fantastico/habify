import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { FrequencyLabel } from "@/constants/frequency-labels";
import { HabitFrequency, Tag } from "@/lib/types";
import { View, Pressable } from "react-native";

interface StatsFiltersProps {
  filters: {
    frequency?: HabitFrequency;
    startDate?: string;
    endDate?: string;
    tags?: string[];
  };
  onFiltersChange: (filters: {
    frequency?: HabitFrequency;
    startDate?: string;
    endDate?: string;
    tags?: string[];
  }) => void;
  tags: Tag[];
  onApply: () => void;
  onClear: () => void;
}

export function StatsFilters({
  filters,
  onFiltersChange,
  tags,
  onApply,
  onClear,
}: StatsFiltersProps) {
  const toggleTag = (tagName: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter((t) => t !== tagName)
      : [...currentTags, tagName];
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  return (
    <Card>
      <View className="gap-4">
        <View className="gap-2">
          <Text>Frequência</Text>
          <View className="flex-row gap-2">
            <Button
              variant={filters.frequency === undefined ? "solid" : "outline"}
              onPress={() =>
                onFiltersChange({ ...filters, frequency: undefined })
              }
              className="flex-1"
            >
              <Text>Todas</Text>
            </Button>
            {(["daily", "weekly", "monthly"] as HabitFrequency[]).map(
              (freq) => (
                <Button
                  key={freq}
                  variant={filters.frequency === freq ? "solid" : "outline"}
                  onPress={() =>
                    onFiltersChange({ ...filters, frequency: freq })
                  }
                  className="flex-1"
                >
                  <Text>{FrequencyLabel[freq]}</Text>
                </Button>
              ),
            )}
          </View>
        </View>

        <View className="gap-2">
          <Text>Data Inicial (YYYY-MM-DD)</Text>
          {/* <Input
            placeholder="2024-01-01"
            value={filters.startDate || ""}
            onChangeText={(text) =>
              onFiltersChange({ ...filters, startDate: text || undefined })
            }
          /> */}
        </View>

        <View className="gap-2">
          <Text>Data Final (YYYY-MM-DD)</Text>
          {/* <Input
            placeholder="2024-12-31"
            value={filters.endDate || ""}
            onChangeText={(text) =>
              onFiltersChange({ ...filters, endDate: text || undefined })
            }
          /> */}
        </View>

        <View className="gap-2">
          <Text>Tags</Text>
          {tags.length === 0 ? (
            <View className="rounded-md border border-dashed border-border p-4">
              <Text className="text-center">Nenhuma tag disponível</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = filters.tags?.includes(tag.name) || false;
                return (
                  <Pressable
                    key={tag.id}
                    onPress={() => toggleTag(tag.name)}
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
                      <Text>{tag.name}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View className="flex-row gap-2">
          <Button variant="outline" onPress={onClear} className="flex-1">
            <Text>Limpar</Text>
          </Button>
          <Button onPress={onApply} className="flex-1">
            <Text>Aplicar</Text>
          </Button>
        </View>
      </View>
    </Card>
  );
}
