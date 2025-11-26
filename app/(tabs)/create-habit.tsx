import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ArrowLeftIcon } from "lucide-react-native";
import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { View, ScrollView, Alert } from "react-native";
import { getAllTags } from "@/api/tag";
import { createHabit } from "@/api/habit";
import { HabitForm, HabitFormData } from "@/components/habits/HabitForm";
import { Tag } from "@/lib/types";

export default function CreateHabitScreen() {
  const router = useRouter();
  const [tags, setTags] = React.useState<Tag[]>([]);

  const [formData, setFormData] = React.useState<HabitFormData>({
    name: "",
    description: "",
    frequency: "daily",
    selectedTagIds: [],
  });

  React.useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const allTags = await getAllTags();
      setTags(allTags);
    } catch (error) {
      console.error("Erro ao carregar tags:", error);
      Alert.alert("Erro", "Não foi possível carregar as tags");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Erro", "O nome do hábito é obrigatório");
      return;
    }

    try {
      await createHabit(
        formData.name.trim(),
        formData.description.trim(),
        formData.frequency,
        formData.selectedTagIds.map(String)
      );

      Alert.alert("Sucesso", "Hábito criado com sucesso!");
      router.push("/(tabs)/home");

    } catch (error) {
      console.error("Erro ao criar hábito:", error);
      Alert.alert("Erro", "Não foi possível criar o hábito");
    }
  };

  const handleCancel = () => {
    router.push("/(tabs)/home");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Criar Hábito",
          headerLeft: () => (
            <Button
              size="sm"
              variant="outline"
              onPress={() => router.push("/(tabs)/home")}
              className="mx-4"
            >
              <Icon as={ArrowLeftIcon} />
            </Button>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-background">
        <View className="gap-6 p-4">
          <HabitForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Criar"
            tags={tags}
          />

        </View>
      </ScrollView>
    </>
  );
}
