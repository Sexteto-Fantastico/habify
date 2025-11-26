import React from "react";
import { Button } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { TagSelector } from "@/components/tags/TagSelector";
import { HabitFrequency, Tag } from "@/lib/types";
import { Text } from "@/components/ui/text";
import { View, ScrollView } from "react-native";

export interface HabitFormData {
  name: string;
  description: string;
  frequency: HabitFrequency;
  selectedTagIds: number[];
}

interface HabitFormProps {
  formData: HabitFormData;
  onChange: (data: HabitFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
  tags: Tag[];
}

const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
};

export function HabitForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  tags,
}: HabitFormProps) {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="gap-4">

        <View className="gap-2">
          <Text>Nome *</Text>
          <Input>
            <InputField
              placeholder="Leitura"
              value={formData.name}
              onChangeText={(text) =>
                onChange({ ...formData, name: text })
              }
            />
          </Input>
        </View>

        <View className="gap-2">
          <Text>Descrição</Text>
          <Input>
            <InputField
              placeholder="Descreva seu hábito"
              value={formData.description}
              onChangeText={(text) =>
                onChange({ ...formData, description: text })
              }
              multiline
              numberOfLines={3}
            />
          </Input>
        </View>

        <View className="gap-2">
          <Text size="sm">Frequência</Text>
          <View className="flex-row gap-2">
            {(["daily", "weekly", "monthly"] as HabitFrequency[]).map(
              (freq) => (
                <Button
                  key={freq}
                  variant={formData.frequency === freq ? "solid" : "outline"}
                  onPress={() => onChange({ ...formData, frequency: freq })}
                  className="flex-1"
                >
                  <Text>{FREQUENCY_LABELS[freq]}</Text>
                </Button>
              )
            )}
          </View>
        </View>

        <TagSelector
          tags={tags}
          selectedTagIds={formData.selectedTagIds}
          onToggle={(tagId) => {
            const newSelectedIds = formData.selectedTagIds.includes(tagId)
              ? formData.selectedTagIds.filter((id) => id !== tagId)
              : [...formData.selectedTagIds, tagId];
            onChange({ ...formData, selectedTagIds: newSelectedIds });
          }}
        />

        <View className="flex-row gap-2 pb-4">
          <Button variant="outline" onPress={onCancel} className="flex-1">
            <Text>Cancelar</Text>
          </Button>
          <Button onPress={onSubmit} className="flex-1">
            <Text>{submitLabel}</Text>
          </Button>
        </View>

      </View>
    </ScrollView>
  );
}
