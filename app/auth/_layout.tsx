import { useRouter, usePathname, useNavigation, Slot } from "expo-router";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { ChevronLeftIcon } from "lucide-react-native";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Keyboard, Platform } from "react-native";

export default function AuthLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();

  const hiddenHeaderRoutes = [
    "/auth/splash-screen",
    "/auth/login-screen"
  ];

  const isHeaderHidden = hiddenHeaderRoutes.some(route => pathname.includes(route));

  const getHeaderTitle = () => {
    if (pathname.includes("/register")) return "Criar conta";

    return "Continue com e-mail";
  };

  const handleBack = () => {
    Keyboard.dismiss();

    if (Platform.OS === 'web') {
      (document.activeElement as HTMLElement)?.blur();
    }

    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/auth/login-screen"); 
    }
  };

  return (
    <Box className="flex-1 bg-white">
      {!isHeaderHidden && (
        <HStack className="p-4 items-center justify-between border-b border-gray-200">
          <Button
            size="lg"
            variant="outline"
            onPress={handleBack}
            className="px-3 border border-gray-300 rounded-2xl active:border-black data-[active=true]:border-black"
          >
            <ButtonIcon as={ChevronLeftIcon} className="text-black w-5 h-5" />
          </Button>

          <Text className="flex-1 font-bold text-xl ml-4">
            {getHeaderTitle()}
          </Text>
        </HStack>
      )}
      
      <Slot></Slot>
    </Box>
  );
}
