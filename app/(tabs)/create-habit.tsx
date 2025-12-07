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
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";

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
        formData.selectedTagIds.map(String),
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
    <SafeAreaView className="flex-1 bg-background-100">
      <ScrollView className="pb-32 p-4">
        <VStack space="sm" className="px-4 py-4">
          <Heading size="2xl">Criar Hábito</Heading>
          <Text className="text-typography-500">
            Crie novos hábitos para uma vida mais saudável!
          </Text>
        </VStack>
        <View className="gap-6">
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
    </SafeAreaView>
  );
}
