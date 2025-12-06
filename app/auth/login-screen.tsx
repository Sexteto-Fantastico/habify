import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { LogInIcon } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { GoogleLogo } from "@/components/icons/GoogleLogo";
import { loginWithGoogle } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { login: signIn } = useAuth();

  const fadeText = useRef(new Animated.Value(0)).current;
  const slideText = useRef(new Animated.Value(30)).current;

  const fadeBtns = useRef(new Animated.Value(0)).current;
  const slideBtns = useRef(new Animated.Value(50)).current;

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  //   responseType: 'id_token'
  // });

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeText, {
          toValue: 1,
          duration: 800,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.spring(slideText, {
          toValue: 0,
          friction: 8,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeBtns, {
          toValue: 1,
          duration: 800,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.spring(slideBtns, {
          toValue: 0,
          friction: 8,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    ]).start();
  }, []);

  // useEffect(() => {
  //   if (response?.type === "success") {
  //     console.log("GOOGLE: Resposta de sucesso recebida", response);

  //     const { authentication } = response;

  //     const token = authentication?.idToken || response.params.id_token;

  //     if (token) {
  //       handleGoogleLogin(token);
  //     } else {
  //       console.warn("GOOGLE: Auth sucesso, mas id_token é nulo.", response);
  //       Alert.alert("Atenção", "O Google não retornou o token de identidade necessário.");
  //     }
  //   } else if (response?.type === "error") {
  //     console.error("GOOGLE: Erro no retorno do Google", response.error);
  //     Alert.alert("Erro", "Falha na autenticação com Google");
  //   }
  // }, [response]);

  const handleSuccess = async (data: any) => {
    try {
      await signIn({
        id: data.userId,
        name: data.name,
        token: data.token,
        avatar: data.avatar,
      });

      console.log("LOGIN - Dados salvos no storage com sucesso.");
      router.replace("/home");
    } catch (e) {
      console.error("Erro ao salvar dados", e);
    }
  };

  const handleGoogleLogin = async (googleToken: string) => {
    setIsLoading(true);
    try {
      const data = await loginWithGoogle(googleToken);
      console.log("GOOGLE LOGIN - Sucesso:", data);
      await handleSuccess(data);
    } catch (error: any) {
      console.error("GOOGLE LOGIN - Erro no Backend:", error);
      Alert.alert("Erro", "Não foi possível validar o login com o Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToEmailLogin = () => {
    router.push("/auth/login");
  };

  return (
    <LinearGradient
      colors={["#6B73FF", "#000DFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Image
        source={require("@/assets/images/circle-bg.png")}
        alt="Background Pattern"
        resizeMode="contain"
        className="absolute w-full h-full"
      />

      <Box className="flex-1 justify-between px-6 py-12">
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            opacity: fadeText,
            transform: [{ translateY: slideText }],
          }}
        >
          <Text className="text-white text-5xl font-bold leading-tight">
            Comece a criar bons hábitos agora
          </Text>
        </Animated.View>

        <Animated.View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            gap: 16,
            opacity: fadeBtns,
            transform: [{ translateY: slideBtns }],
          }}
        >
          <Button
            className="w-full h-16 rounded-full bg-white active:bg-gray-200"
            size="lg"
            onPress={redirectToEmailLogin}
            disabled={isLoading}
          >
            <Box className="flex-row items-center gap-3">
              <LogInIcon color="#040415" size={20} />
              <ButtonText className="font-semibold text-lg text-[#040415]">
                Entrar com e-mail
              </ButtonText>
            </Box>
          </Button>

          {/* <Button
            variant="outline"
            className="w-full h-16 rounded-full bg-white border border-gray-300 shadow-sm active:bg-gray-200"
            size="lg"
            onPress={() => promptAsync()}
            disabled={isLoading || !request}
          >
             {isLoading ? (
               <ActivityIndicator color="#040415" />
             ) : (
               <Box className="flex-row items-center gap-3">
                 <GoogleLogo width={24} height={24} />
                 <ButtonText className="font-semibold text-lg text-[#040415]">
                    Entrar com Google
                 </ButtonText>
               </Box>
             )}
          </Button> */}
        </Animated.View>
      </Box>
    </LinearGradient>
  );
}
