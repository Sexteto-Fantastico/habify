import { useEffect } from "react";
import { useRouter, useRootNavigationState } from "expo-router";

export default function Home() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    const timer = setTimeout(() => {
      router.replace("/auth/splash-screen"); 
    }, 2000);

    return () => clearTimeout(timer);
  }, [rootNavigationState?.key]); 
}