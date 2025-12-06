import React, { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from "@/components/ui/avatar";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { ScrollView } from "react-native";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import {
  CalendarIcon,
  LightbulbIcon,
  LogOutIcon,
  Mail,
  Trash2Icon,
} from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { getUser } from "@/api/user";
import { User } from "@/lib/types";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";

export default function ProfilePage() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { signOut } = useAuth();

  const deleteAccount = () => {
    setDeleteOpen(false);
  };

  const loadUser = async () => {
    const user = await getUser();
    setUser(user);
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <>
      <SafeAreaView
        className="gap-8 p-6 bg-background-0 border border-typography-100 border-b-2"
        edges={["top"]}
      >
        <Heading size="2xl">Seu Perfil</Heading>
        <HStack space="3xl" className="items-center">
          <Avatar size="lg">
            <AvatarFallbackText>{user?.name}</AvatarFallbackText>
            <AvatarImage source={user?.avatar || user?.name.charAt(0)} />
          </Avatar>

          <VStack>
            <Heading size="xl" className="mb-2">
              {user?.name}
            </Heading>
            <HStack className="items-center">
              <Icon as={Mail} size="xs" className="mr-2 text-typography-500" />
              <Text size="sm" className="text-typography-500">
                {user?.email}
              </Text>
            </HStack>
            <HStack className="items-center">
              <Icon
                as={CalendarIcon}
                size="xs"
                className="mr-2 text-typography-500"
              />
              <Text size="sm" className="text-typography-500">
                Desde{" "}
                {new Date(user?.createdAt ?? Date.now()).toLocaleDateString()}
              </Text>
            </HStack>
          </VStack>
        </HStack>
      </SafeAreaView>
      <ScrollView className="p-4 bg-background-100">
        <Card>
          <Box className="mb-4">
            <Text size="xl">Geral</Text>
          </Box>
          <HStack className="justify-between items-center px-2">
            <Box className="flex-row gap-2 items-center">
              <Icon as={LightbulbIcon} size="xl" />
              <Text className="font-medium" size="lg">
                Modo Escuro
              </Text>
            </Box>

            <Switch
              value={colorScheme === "dark"}
              onValueChange={toggleColorScheme}
            />
          </HStack>
        </Card>

        <Card className="mt-4">
          <Box className="flex-row justify-between items-center mb-4">
            <Text size="xl">Conta</Text>
          </Box>
          <Box className="flex-row gap-2 p-2">
            <Box className="flex-1">
              <Button
                size="sm"
                variant="outline"
                action="secondary"
                onPress={signOut}
              >
                <ButtonIcon as={LogOutIcon} />
                <ButtonText>Sair da Conta</ButtonText>
              </Button>
            </Box>

            <Box className="flex-1">
              <Button
                size="sm"
                action="negative"
                onPress={() => setDeleteOpen(true)}
              >
                <ButtonIcon as={Trash2Icon} />
                <ButtonText>Deletar Conta</ButtonText>
              </Button>
            </Box>
          </Box>
        </Card>

        <AlertDialog
          size="md"
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
        >
          <AlertDialogBackdrop />
          <AlertDialogContent>
            <AlertDialogHeader>
              <Heading size="lg" className="text-red-600">
                Deletar Conta
              </Heading>
            </AlertDialogHeader>

            <AlertDialogBody className="mt-3 mb-4">
              <Text>
                Tem certeza que deseja excluir sua conta? Essa ação não pode ser
                desfeita.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setDeleteOpen(false)}
              >
                <ButtonText>Cancelar</ButtonText>
              </Button>

              <Button variant="solid" action="negative" onPress={deleteAccount}>
                <ButtonText>Deletar</ButtonText>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ScrollView>
    </>
  );
}
