import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenExpired } from './utils/token';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { InfoIcon } from '@/components/ui/icon';
import { STORAGE_KEY } from '@/constants/auth';

interface UserDTO {
  id: string;
  name: string;
  avatar?: string;
  token?: string;
}

interface AuthContextData {
  user: UserDTO | null;
  loading: boolean;
  signIn: (userData: UserDTO) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<UserDTO>) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserDTO | null>(null);
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
          </Alert>
        } else {
          setUser(userData);
        }

      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }    
    }

    loadStorageData();
  }, []);

  async function signIn(userData: UserDTO) {
    try {
      setUser(userData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar login:', error);
      throw new Error('Falha ao salvar dados de login');
    }
  }

  async function signOut() {
    try {
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  async function updateUser(updates: Partial<UserDTO>) {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}