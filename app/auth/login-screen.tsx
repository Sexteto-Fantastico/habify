import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { LogInIcon } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const fadeText = useRef(new Animated.Value(0)).current;
  const slideText = useRef(new Animated.Value(30)).current;

  const fadeBtns = useRef(new Animated.Value(0)).current;
  const slideBtns = useRef(new Animated.Value(50)).current;

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
            className="w-full h-16 rounded-full bg-white active:bg-background-50"
            size="lg"
            onPress={redirectToEmailLogin}
            disabled={isLoading}
          >
            <Box className="flex-row items-center gap-3">
              <LogInIcon color="#151515" size={20} />
              <ButtonText className="font-semibold text-lg text-typography-black">
                Entrar com e-mail
              </ButtonText>
            </Box>
          </Button>
        </Animated.View>
      </Box>
    </LinearGradient>
  );
}