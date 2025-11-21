import { tva } from "@gluestack-ui/utils/nativewind-utils";
import { isWeb } from "@gluestack-ui/utils/nativewind-utils";
const baseStyle = isWeb ? "flex flex-col relative z-0" : "";

export const cardStyle = tva({
  base: `${baseStyle} rounded-xl border border-outline-50 border-b-2`,
  variants: {
    size: {
      sm: "p-3 rounded-xl",
      md: "p-4 rounded-2xl",
      lg: "p-6 rounded-3xl",
    },
    variant: {
      elevated: "bg-background-0",
      outline: "border-outline-200",
      ghost: "rounded-none",
      filled: "bg-background-50",
    },
  },
});
