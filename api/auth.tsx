import api from "./config/axios";

const BASE_URL = "/auth";

export type LoginData = {
  token: string;
  userId: string;
  name: string;
  avatar?: string;
};

export async function register(name: string, email: string, password: string): Promise<number> {
  const response = await api.post(`${BASE_URL}/register`, { email, password, name });
  return response.data;
}

export async function login(email: string, password: string): Promise<LoginData> {
  const response = await api.post(`${BASE_URL}/login`, { email, password, rememberMe: true });
  return response.data;
}

export async function google(token: string): Promise<LoginData> {
  const response = await api.post(`${BASE_URL}/google`, { token });
  return response.data;
}
