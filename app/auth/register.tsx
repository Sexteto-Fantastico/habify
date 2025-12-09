import React, { useState, useEffect, useRef } from "react";
import { 
  Text, 
  Keyboard, 
  Platform, 
  Animated,
  ActivityIndicator,
  Pressable
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { AuthForm } from "@/components/auth/AuthForm";
import { register } from "@/api/auth";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";

export default function Register() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fadeHeader = useRef(new Animated.Value(0)).current;
  const slideHeader = useRef(new Animated.Value(20)).current;

  const fadeForm = useRef(new Animated.Value(0)).current;
  const slideForm = useRef(new Animated.Value(30)).current;

  const fadeFooter = useRef(new Animated.Value(0)).current;
  const slideFooter = useRef(new Animated.Value(40)).current;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", 
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeHeader, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== "web" }),
        Animated.spring(slideHeader, { toValue: 0, friction: 8, useNativeDriver: Platform.OS !== "web" }),
      ]),
      Animated.parallel([
        Animated.timing(fadeForm, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== "web" }),
        Animated.spring(slideForm, { toValue: 0, friction: 8, useNativeDriver: Platform.OS !== "web" }),
      ]),
      Animated.parallel([
        Animated.timing(fadeFooter, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== "web" }),
        Animated.spring(slideFooter, { toValue: 0, friction: 8, useNativeDriver: Platform.OS !== "web" }),
      ]),
    ]).start();
  }, []);

  const handleChange = (field: keyof typeof formData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
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

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "As senhas não coincidem.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      
      toast.show({
        placement: "top",
        duration: 2000,
        avoidKeyboard: true,
        onCloseComplete: () => { router.replace("/auth/login") },
        render: ({ id }) => {
          return (
            <Toast nativeID={"toast-" + id} action="success" variant="outline">
              <VStack space="xs">
                <ToastTitle>Conta criada!</ToastTitle>
                <ToastDescription>
                  Redirecionando para o login...
                </ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    } catch (error: any) {
      console.error("REGISTER - Erro:", error);
      const errorMessage = error.response?.data?.message || "Erro ao registrar.";      
      toast.show({
        placement: "top",
        avoidKeyboard: true,
        render: ({ id }) => {
          return (
            <Toast nativeID={"toast-" + id} action="error" variant="solid">
              <VStack space="xs">
                <ToastTitle>Erro</ToastTitle>
                <ToastDescription>{errorMessage}</ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="bg-background-0 px-6 py-8 justify-center">
      <VStack space="xl" className="w-full">
        
        <Animated.View style={{ opacity: fadeHeader, transform: [{ translateY: slideHeader }] }}>
          <Text className="text-4xl font-bold text-typography-950 mb-2">
            Crie sua conta
          </Text>
          <Text className="text-typography-500 text-lg">
            Junte-se a nós e comece sua jornada.
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeForm, transform: [{ translateY: slideForm }] }}>
          <VStack space="md">
            <AuthForm
              label="Nome"
              placeholder="Seu nome completo"
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              errorMessage={errors.name}
              keyboardType="default"
              autoCapitalize="words"
              editable={!isLoading}
            />
            {/* ... Outros campos do form ... */}
            <AuthForm
              label="Email"
              placeholder="seu@email.com"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              errorMessage={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            <AuthForm
              label="Senha"
              placeholder="Crie uma senha forte"
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
              errorMessage={errors.password}
              type="password"
              editable={!isLoading}
            />
            <AuthForm
              label="Confirme a senha"
              placeholder="Repita sua senha"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              errorMessage={errors.confirmPassword}
              type="password"
              editable={!isLoading}
            />
          </VStack>
        </Animated.View>

        <Animated.View style={{ opacity: fadeFooter, transform: [{ translateY: slideFooter }], marginTop: 24 }}>
          <Button
            className={`w-full h-14 rounded-full ${isLoading ? "bg-background-300" : "bg-primary-500"}`}
            size="lg"
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
               <ActivityIndicator color="#fff" />
            ) : (
              <ButtonText className="font-semibold text-lg text-white">
                Registrar
              </ButtonText>
            )}
          </Button>
          
          <Box className="mt-6 flex-row justify-center items-center">
            <Text className="text-typography-500 text-base mr-1">Já tem uma conta?</Text>
            <Link href="/auth/login" asChild>
              <Pressable hitSlop={10}>
                {({ pressed }) => (
                  <Text className={`font-bold text-base ${pressed ? "text-primary-700" : "text-primary-500"}`}>
                    Faça login
                  </Text>
                )}
              </Pressable>
            </Link>
          </Box>
        </Animated.View>

      </VStack>
    </Box>
  );
}