import { useRouter, usePathname, useNavigation, Slot } from "expo-router";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { ChevronLeftIcon } from "lucide-react-native";
import { Button, ButtonIcon } from "@/components/ui/button";
import { useColorScheme } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context"; 
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function AuthLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();

  const iconColor = colorScheme === "dark" ? "#F5F5F5" : "#151515";
  const isLandingScreen = pathname.includes("/auth/login-screen");

  if (isLandingScreen) {
    return (
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    );
  }

  const getHeaderTitle = () => {
    if (pathname.includes("/register")) return "Criar conta";
    return "Continue com e-mail";
  };

  const handleBack = () => {
    Keyboard.dismiss();
    if (Platform.OS === "web") {
      (document.activeElement as HTMLElement)?.blur();
    }
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/auth/login-screen");
    }
  };

  return (
    <Box className="flex-1 bg-background-0">
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <HStack className="p-4 items-center justify-between z-10">
            <Button 
              size="lg" 
              variant="outline" 
              onPress={handleBack}
              className="border-outline-200 active:bg-background-50"
            >
              <ButtonIcon as={ChevronLeftIcon} color={iconColor} />
            </Button>

            <Text className="flex-1 font-bold text-xl ml-4 text-typography-900">
              {getHeaderTitle()}
            </Text>
          </HStack>

          <ScrollView
            contentContainerStyle={{ 
                flexGrow: 1, 
                justifyContent: 'center' 
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >

          <Slot />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
}