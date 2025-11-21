import "@/styles/global.css";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { SafeAreaView } from "@/components/ui/safe-area-view";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <GluestackUIProvider mode={colorMode}>
      <ThemeProvider value={colorMode === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
