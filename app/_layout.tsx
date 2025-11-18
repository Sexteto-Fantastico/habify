import "@/global.css";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Slot } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
        <Slot />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
