import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

export default function Home() {
  return (
    <Box className="flex-1 bg-background h-[100vh]">
      <Box className="flex flex-1 items-center justify-center">
        <Text size="2xl" className="text-primary-900">
          Habify
        </Text>
      </Box>
    </Box>
  );
}
