import { Text } from "@/components/ui/text";
import { Tag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Box } from "../ui/box";

interface TagBadgeProps {
  tag: Tag;
  size?: "sm" | "md";
}

export function TagBadge({ tag, size = "md" }: TagBadgeProps) {
  const textSize = size === "sm" ? "text-sm" : "text-md";

  return (
    <Box
      className={cn("flex flex-row items-center rounded-full px-2 py-1")}
      style={{ backgroundColor: tag.color }}
    >
      <Text size="sm" className={cn(textSize, "font-medium text-white")}>
        {tag.name}
      </Text>
    </Box>
  );
}
