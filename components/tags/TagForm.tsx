import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { TAGS_COLORS } from "@/constants/colors";
import { Tag } from "@/lib/types";
import { View, Pressable, ScrollView } from "react-native";
import { Card } from "../ui/card";

interface TagFormData {
  name: string;
  color: string;
}

interface TagFormProps {
  formData: TagFormData;
  onChange: (data: TagFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  editingTag?: Tag | null;
}

export function TagForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  editingTag,
}: TagFormProps) {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Card className="gap-4">
        <View className="gap-2">
          <Text size="sm">Nome *</Text>
          <Input>
            <InputField
              value={formData.name}
              onChangeText={(name) => onChange({ ...formData, name: name })}
            />
          </Input>
        </View>
        <View className="gap-2">
          <Text size="sm">Cor</Text>
          <View className="flex-row flex-wrap gap-2">
            {TAGS_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => onChange({ ...formData, color })}
                className={`h-8 w-8 rounded-full border-2 ${
                  formData.color === color
                    ? "border-typography-900"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </View>
        </View>
        <View className="flex-row gap-2 pb-4">
          <Button variant="outline" onPress={onCancel} className="flex-1">
            <ButtonText>Cancelar</ButtonText>
          </Button>
          <Button onPress={onSubmit} className="flex-1">
            <ButtonText>{editingTag ? "Salvar" : "Criar"}</ButtonText>
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}
