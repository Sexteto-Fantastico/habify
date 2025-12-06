import { useRouter, usePathname, useNavigation, Slot } from "expo-router";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { ChevronLeftIcon } from "lucide-react-native";
import { Button, ButtonIcon } from "@/components/ui/button";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

export default function AuthLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();

  const hiddenHeaderRoutes = ["/auth/login-screen"];

  const isHeaderHidden = hiddenHeaderRoutes.some((route) =>
    pathname.includes(route),
  );

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Box className="flex-1 bg-background-0">
          {!isHeaderHidden && (
            <HStack className="p-4 items-center justify-between">
              <Button size="lg" variant="outline" onPress={handleBack}>
                <ButtonIcon as={ChevronLeftIcon} />
              </Button>

              <Text className="flex-1 font-bold text-xl ml-4">
                {getHeaderTitle()}
              </Text>
            </HStack>
          )}

          <Slot />
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
