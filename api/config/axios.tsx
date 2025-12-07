import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationService from "@/app/auth/navigation";
import { STORAGE_KEY } from "@/constants/auth";
import Constants from "expo-constants";

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(":")[0];

if (!localhost) {
  throw new Error("Localhost IP não encontrado. Verifique se está rodando no Expo Go.");
}

const API_BASE_URL = `http://${localhost}:3001/api`;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10s
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (jsonValue && config.headers) {
        const userData = JSON.parse(jsonValue);
        
        const token = userData?.token; 

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("Token anexado ao header com sucesso"); 
        }
      }
    } catch (error) {
      console.error("Erro ao recuperar token no interceptor:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    let txtMensagem = "Ocorreu um erro inesperado. Tente novamente mais tarde.";

    if (error.response) {
      const { data, status } = error.response;

      if (data && typeof data === 'object') {
        if ('error' in data) {
          txtMensagem = (data as any).error;
        } else if ('message' in data) {
          txtMensagem = (data as any).message;
        }
      } else if (typeof data === 'string') {
        txtMensagem = data;
      }

      if (status === 401) {
        try {
          await AsyncStorage.removeItem(STORAGE_KEY);
          NavigationService.resetToLogin();
          
          return Promise.reject(new Error("Sessão expirada. Faça login novamente."));
        } catch (logoutError) {
          console.log("Erro ao limpar dados de sessão", logoutError);
        }
      }
    } else if (error.request) {
      txtMensagem = "Falha na conexão com o servidor. Verifique sua internet.";
    }

    return Promise.reject(new Error(txtMensagem));
  },
);

export default api;