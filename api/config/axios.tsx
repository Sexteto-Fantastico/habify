import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Todo: colocar em um env
const API_BASE_URL = 'http://localhost:3001/api'; 

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição (adiciona o token de autenticação, por exemplo)
api.interceptors.request.use(
  async (config) => {
    // Todo: Obter token do AsyncStorage ou outro storage
    // const token = await AsyncStorage.getItem('userToken');
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2Mzg0MTE0OCwiZXhwIjoxNzY2NDMzMTQ4fQ.aaeRJmQS7Ym01BjyfkUaTwFyd7S52lLufrNrmYFp5pE'; // Substitua pela lógica real

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      //config.withCredentials = true;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Sessão expirada. Redirecionando para o login...');
      // Todo: Lógica para deslogar o usuário e redirecionar
    }
    
    return Promise.reject(error);
  }
);

export default api;