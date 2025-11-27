import React, { useState } from "react";
import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { AuthForm } from "@/components/auth/AuthForm";
import { login } from "@/api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Insira um email válido.";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Insira sua senha.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const data = await login(formData.email, formData.password);

      await AsyncStorage.setItem("@auth_token", data.token);
      await AsyncStorage.setItem("@user_data", JSON.stringify(data));
      console.log("LOGIN - Dados salvos no storage com sucesso.");

      router.replace("/home");
    } catch (error: any) {
      console.error("LOGIN - Erro:", error);
      const errorMessage = error.response?.data?.message || "Erro ao entrar.";
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
          onPress={handleLogin}
          disabled={isLoading}
        >
          <ButtonText className="font-semibold">
            {isLoading ? "Entrando..." : "Entrar"}
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
