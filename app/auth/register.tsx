import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Alert } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { AuthForm } from "@/components/auth/AuthForm";
import { register } from "@/api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleChange = (field: keyof typeof formData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Insira um email válido.";
      isValid = false;
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const data = await register(
        formData.name,
        formData.email,
        formData.password,
      );

      await AsyncStorage.setItem("@user_data", JSON.stringify(data));
      console.log("REGISTER - Dados salvos no storage com sucesso.");

      router.replace("/auth/login");
    } catch (error: any) {
      console.error("REGISTER - Erro:", error);
      const errorMessage = error.response?.data?.message || "Erro ao registrar.";
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="flex-1 bg-white px-6 py-8">
      <VStack className="flex-1 justify-between">
        <View>
          <AuthForm
            label="Nome"
            placeholder="Insira seu nome"
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
            errorMessage={errors.name}
            keyboardType="default"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <AuthForm
            label="Email"
            placeholder="Insira seu email"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            errorMessage={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <AuthForm
            label="Senha"
            placeholder="Insira sua senha"
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
            errorMessage={errors.password}
            type="password"
            editable={!isLoading}
          />
        </View>

        <Button
          className={`w-full mt-6 p-8 rounded-full ${isLoading ? "bg-gray-400" : "bg-[#3843FF]"}`}
          size="lg"
          onPress={handleRegister}
          disabled={isLoading}
        >
          <ButtonText className="font-semibold">
            {isLoading ? "Registrando..." : "Registrar"}
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
