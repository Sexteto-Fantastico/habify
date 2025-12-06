import api from "./config/axios";
import { User } from "@/lib/types";

export async function getUser(): Promise<User | null> {
  const response = await api.get("/user/me");
  const user: User = response.data;
  return user;
}
