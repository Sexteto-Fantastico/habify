import { Text } from "@/components/ui/text";
import { Tag } from "@/lib/types";
import { View } from "react-native";

interface TagBadgeProps {
  tag: Tag;
  size?: "sm" | "md";
  showColor?: boolean;
}

export function TagBadge({
  tag,
  size = "md",
  showColor = true,
}: TagBadgeProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
  };

  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <View className="flex-row items-center gap-1 rounded-full bg-muted px-2 py-1">
      {showColor && (
        <View
          className={`${sizeClasses[size]} rounded-full`}
          style={{ backgroundColor: tag.color }}
        />
      )}
      <Text size="sm" className={textSize}>
        {tag.name}
      </Text>
    </View>
  );
}
