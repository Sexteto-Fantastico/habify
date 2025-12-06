import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isTokenExpired } from "@/lib/token";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { InfoIcon } from "@/components/ui/icon";
import { STORAGE_KEY } from "@/constants/auth";
import { User } from "@/lib/types";
import { login } from "@/api/auth";

interface SignInData {
  email: string;
  password: string;
}

interface UserContext {
  id: number;
  name: string;
  avatar?: string;
  token?: string;
}

interface AuthContextData {
  user: UserContext | null;
  loading: boolean;
  signIn: (loginData: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  isSignedIn: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);

        if (!jsonValue) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(jsonValue);

        if (userData?.token && isTokenExpired(userData.token)) {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setUser(null);

          <Alert action="info" variant="outline">
            <AlertIcon as={InfoIcon} />
            <AlertText>Description of alert!</AlertText>
          </Alert>;
        } else {
          setUser(userData);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(loginData: SignInData) {
    try {
      const data = await login(loginData.email, loginData.password);

      const userData: UserContext = {
        id: parseInt(data.userId),
        name: data.name,
        token: data.token,
        avatar: data.avatar,
      };

      setUser(userData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Erro ao salvar login:", error);
      throw new Error("Falha ao salvar dados de login");
    }
  }

  async function signOut() {
    try {
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, isSignedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}
