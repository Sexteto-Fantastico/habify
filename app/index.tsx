import React, { useEffect, useRef } from "react";
import { Platform, Animated, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { BookCheck } from "lucide-react-native";

export default function SplashScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/auth/login-screen");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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

      <Box className="flex-1 items-center justify-center z-10">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: "center",
          }}
        >
          <HStack className="items-center space-x-3">
            <BookCheck size={80} color="#FFFFFF" />
            <Text className="text-white text-6xl font-semibold">Habify</Text>
          </HStack>
        </Animated.View>
      </Box>
    </LinearGradient>
  );
}
