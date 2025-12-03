import React, { useState } from "react";
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
import { LightbulbIcon, LogOutIcon, Trash2Icon } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { Stack } from "expo-router";
import { User } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const [user, setUser] = useState<User>({
    id: 1,
    name: "Pedro",
    email: "pedro@example.com",
    avatar: "SC",
    createdAt: new Date(),
  });

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { signOut } = useAuth();

  const logout = () => {
    console.log("Usuário deslogado");
    signOut();
  };

  const deleteAccount = () => {
    console.log("Conta deletada");
    // lógica real aqui
    setDeleteOpen(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          header: () => {
            return (
              <SafeAreaView
                className="gap-8 p-6 bg-background-0 border border-typography-100 border-b-2"
                edges={["top"]}
              >
                <Heading size="2xl">Seu Perfil</Heading>
                <Box className="flex-row justify-between items-center">
                  <Box className="flex-row items-center justify-center gap-4">
                    <Avatar size="lg">
                      <AvatarFallbackText>{user.name}</AvatarFallbackText>
                      <AvatarImage source={undefined} />
                    </Avatar>

                    <Box>
                      <Heading size="xl">{user.name}</Heading>
                      <Text className="text-typography-500">{user.email}</Text>
                    </Box>
                  </Box>
                </Box>
              </SafeAreaView>
            );
          },
        }}
      />

      <ScrollView className="p-6 bg-background-100">
        {/* Geral */}
        <Box className="flex gap-2 mb-6">
          <Heading className="text-typography-400 text-sm">
            {"Geral".toUpperCase()}
          </Heading>

          <Card className="rounded-xl">
            <Box className="flex-row justify-between items-center">
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
            </Box>
          </Card>
        </Box>

        <Box className="flex gap-2">
          <Heading className="text-typography-400 text-sm">
            {"Conta".toUpperCase()}
          </Heading>

          <Card>
            <Box className="flex-row gap-4">
              <Box className="flex-1">
                <Button variant="outline" action="secondary" onPress={logout}>
                  <ButtonIcon as={LogOutIcon} />
                  <ButtonText>Sair da Conta</ButtonText>
                </Button>
              </Box>

              <Box className="flex-1">
                <Button action="negative" onPress={() => setDeleteOpen(true)}>
                  <ButtonIcon as={Trash2Icon} />
                  <ButtonText>Deletar Conta</ButtonText>
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>

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
