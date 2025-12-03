import React, { useState, useEffect, useRef } from "react";
import { 
  Alert, 
  Pressable, 
  Text, 
  Keyboard, 
  Platform, 
  Animated, 
  KeyboardAvoidingView, 
  ScrollView,
  ActivityIndicator,
} from "react-native"; 
import { Link, useRouter } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { AuthForm } from "@/components/auth/AuthForm";
import { login } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  
  const fadeHeader = useRef(new Animated.Value(0)).current;
  const slideHeader = useRef(new Animated.Value(20)).current;

  const fadeForm = useRef(new Animated.Value(0)).current;
  const slideForm = useRef(new Animated.Value(30)).current;

  const fadeFooter = useRef(new Animated.Value(0)).current;
  const slideFooter = useRef(new Animated.Value(40)).current;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeHeader, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(slideHeader, { toValue: 0, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.parallel([
        Animated.timing(fadeForm, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(slideForm, { toValue: 0, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.parallel([
        Animated.timing(fadeFooter, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(slideFooter, { toValue: 0, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ]).start();
  }, []);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (Platform.OS === 'web') (document.activeElement as HTMLElement)?.blur();

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
      // Pequena animação de "shake" ou feedback visual poderia ser adicionada aqui
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const data = await login(formData.email, formData.password);

      await signIn({
        id: data.userId,
        name: data.name,
        token: data.token,
        avatar: data.avatar,
      });
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Box className="flex-1 bg-white px-6 py-8 justify-center">
          <VStack space="xl" className="flex-1 justify-center">
            
            <Animated.View style={{ opacity: fadeHeader, transform: [{ translateY: slideHeader }] }}>
              <Text className="text-4xl font-bold text-[#040415] mb-2">
                Bem-vindo de volta!
              </Text>
              <Text className="text-gray-500 text-lg">
                Preencha seus dados para continuar.
              </Text>
            </Animated.View>

            <Animated.View style={{ opacity: fadeForm, transform: [{ translateY: slideForm }] }}>
              <VStack space="md">
                <AuthForm
                  label="Email"
                  placeholder="exemplo@email.com"
                  value={formData.email}
                  onChangeText={(text) => handleChange("email", text)}
                  errorMessage={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <AuthForm
                  label="Senha"
                  placeholder="Sua senha secreta"
                  value={formData.password}
                  onChangeText={(text) => handleChange("password", text)}
                  errorMessage={errors.password}
                  type="password"
                  editable={!isLoading}
                />
              </VStack>
            </Animated.View>

            <Animated.View style={{ opacity: fadeFooter, transform: [{ translateY: slideFooter }], marginTop: 20 }}>
              <Button
                className={`w-full h-14 rounded-full ${isLoading ? "bg-gray-300" : "bg-[#3843FF]"}`}
                size="lg"
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ButtonText className="font-bold text-lg">
                    Entrar
                  </ButtonText>
                )}
              </Button>

              <Box className="mt-6 flex-row justify-center items-center">
                <Text className="text-gray-500 text-base mr-1">Não tem uma conta?</Text>
                <Link href="/auth/register" asChild>
                  <Pressable hitSlop={10}>
                    {({ pressed }) => (
                      <Text
                        style={{ 
                          color: pressed ? "#202899" : "#3843FF", 
                          fontWeight: "bold",
                          fontSize: 16
                        }}
                      >
                        Crie agora!
                      </Text>
                    )}
                  </Pressable>
                </Link>
              </Box>
            </Animated.View>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}