import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { TagForm } from "@/components/tags/TagForm";
import { Tag } from "@/lib/types";
import {
  ArrowLeftIcon,
  EditIcon,
  FilterIcon,
  TrashIcon,
} from "lucide-react-native";
import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { View, ScrollView, Alert } from "react-native";
import { getAllTags, createTag, updateTag, deleteTag } from "@/api/tag";
import { TAGS_COLORS } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";

export default function TagsScreen() {
  const router = useRouter();
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    color: TAGS_COLORS[0],
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

  const handleCreateTag = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Erro", "O nome da tag é obrigatório");
      return;
    }

    try {
      await createTag(formData.name.trim(), formData.color);
      setFormData({ name: "", color: TAGS_COLORS[0] });
      await loadTags();
      Alert.alert("Sucesso", "Tag criada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao criar tag:", error);
      if (error.message?.includes("UNIQUE constraint")) {
        Alert.alert("Erro", "Já existe uma tag com este nome");
      } else {
        Alert.alert("Erro", "Não foi possível criar a tag");
      }
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;
    if (!formData.name.trim()) {
      Alert.alert("Erro", "O nome da tag é obrigatório");
      return;
    }

    try {
      await updateTag(editingTag.id, formData.name.trim(), formData.color);
      setEditingTag(null);
      setFormData({ name: "", color: TAGS_COLORS[0] });
      await loadTags();
      Alert.alert("Sucesso", "Tag atualizada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar tag:", error);
      if (error.message?.includes("UNIQUE constraint")) {
        Alert.alert("Erro", "Já existe uma tag com este nome");
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a tag");
      }
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a tag "${tag.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTag(tag.id);
              await loadTags();
              Alert.alert("Sucesso", "Tag excluída com sucesso!");
            } catch (error) {
              console.error("Erro ao excluir tag:", error);
              Alert.alert("Erro", "Não foi possível excluir a tag");
            }
          },
        },
      ],
    );
  };

  const startEditing = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color });
  };

  const handleCancelForm = () => {
    setEditingTag(null);
    setFormData({ name: "", color: TAGS_COLORS[0] });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1 bg-background-100">
        <ScrollView className="pb-32 p-4">
          <View
            style={{ alignItems: "flex-start", marginTop: 16, marginLeft: 8 }}
          >
            <Button
              variant="outline"
              size="md"
              className="rounded-full"
              onPress={() => router.push("/(tabs)/create-habit")}
            >
              <Icon as={ArrowLeftIcon} size="md" />
            </Button>
          </View>
          <VStack space="sm" className="px-4 py-4">
            <Heading size="2xl">Criar Tag</Heading>
            <Text className="text-typography-500">
              Crie e gerencie suas tags para organizar seus hábitos!
            </Text>
          </VStack>
          <View className="gap-6">
            <TagForm
              formData={formData}
              onChange={setFormData}
              onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
              onCancel={handleCancelForm}
              editingTag={editingTag}
            />

            <View className="gap-3">
              <Text size="xl">Minhas Tags</Text>
              {tags.length === 0 ? (
                <Card>
                  <View className="py-2">
                    <Text className="text-center text-muted-foreground">
                      Nenhuma tag criada ainda
                    </Text>
                  </View>
                </Card>
              ) : (
                tags.map((tag) => (
                  <Card key={tag.id}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View
                          className="h-6 w-6 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <Text>{tag.name}</Text>
                      </View>
                      <View className="flex-row items-center justify-between gap-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => startEditing(tag)}
                        >
                          <Icon as={EditIcon} size="sm" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => handleDeleteTag(tag)}
                        >
                          <Icon as={TrashIcon} size="sm" />
                        </Button>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
