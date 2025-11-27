import { router } from 'expo-router';

export default function navigate(path: string, params?: Record<string, unknown>) {
  router.push({ pathname: path as any, params: params as any });
}

export function resetToLogin() {
  router.replace('/auth/login');
}