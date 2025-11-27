import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationService from "@/app/auth/navigation";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001/api";

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
      const token = await AsyncStorage.getItem("@user_token");

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Erro ao recuperar token:", error);
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
          await AsyncStorage.multiRemove(["@user_token", "@user_data"]);
          
          NavigationService.resetToLogin();
          
          return Promise.reject(new Error("Sessão expirada"));
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