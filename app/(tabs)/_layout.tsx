import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { cn } from "@gluestack-ui/utils/nativewind-utils";
import { Tabs } from "expo-router";
import { View as ViewNative } from "react-native";
import {
  ChartColumnIcon,
  HomeIcon,
  ListIcon,
  PlusIcon,
  UserRoundIcon,
} from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={({ state, descriptors, navigation }) => (
        <ViewNative
          style={{
            position: "absolute",
            bottom: 40,
            left: 10,
            right: 10,
          }}
        >
          <Box className="h-20 mx-6">
            <Box className="shadow-lg bg-background-0 rounded-full flex-row justify-between items-center px-6 h-full border border-outline-50">
              {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;
                const isCreateHabit = route.name === "create-habit";

                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                return (
                  <Pressable
                    key={index}
                    onPress={onPress}
                    className={cn(
                      "p-4 items-center justify-center",
                      isCreateHabit && "shadow-lg bg-primary-500 rounded-full",
                    )}
                  >
                    <Icon
                      as={options.tabBarIcon}
                      size="xl"
                      className={cn(
                        isFocused ? "text-primary-500" : "text-typography-900",
                        isCreateHabit && "text-typography-50",
                      )}
                    />
                  </Pressable>
                );
              })}
            </Box>
          </Box>
        </ViewNative>
      )}
    >
      <Tabs.Screen name="home" options={{ tabBarIcon: HomeIcon }} />
      <Tabs.Screen name="list-habits" options={{ tabBarIcon: ListIcon, title: "Meus hábitos" }} />
      <Tabs.Screen name="create-habit" options={{ tabBarIcon: PlusIcon }} />
      <Tabs.Screen name="stats" options={{ tabBarIcon: ChartColumnIcon }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: UserRoundIcon }} />
    </Tabs>
  );
}
