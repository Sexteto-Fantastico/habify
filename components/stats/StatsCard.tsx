import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

interface StatsCardProps {
  title: string;
  description?: string;
  stats: {
    total: number;
    completed: number;
    pending: number;
    notCompleted: number;
  };
  showCompletionRate?: boolean;
}

export function StatsCard({
  title,
  description,
  stats,
  showCompletionRate = false,
}: StatsCardProps) {
  const getStatusColor = (status: "completed" | "pending" | "notCompleted") => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "notCompleted":
        return "text-red-600";
      default:
        return "text-foreground";
    }
  };

  return (
    <View>
      <Text>{title}</Text>
      <Text>{description}</Text>

      <View className="mt-4 grid grid-cols-2 gap-4">
        <Card className="flex-row flex-wrap justify-between">
          <View className="p-4">
            <Text>Total</Text>
            <Text className="text-2xl font-bold">{stats.total}</Text>
          </View>
          <View className="p-4">
            <Text>Completos</Text>
            <Text
              className={`text-2xl font-bold ${getStatusColor("completed")}`}
            >
              {stats.completed}
            </Text>
          </View>
          <View className="p-4">
            <Text>Pendentes</Text>
            <Text className={`text-2xl font-bold ${getStatusColor("pending")}`}>
              {stats.pending}
            </Text>
          </View>
          <View className="p-4">
            <Text>Incompletos</Text>
            <Text
              className={`text-2xl font-bold ${getStatusColor("notCompleted")}`}
            >
              {stats.notCompleted}
            </Text>
          </View>
        </Card>
      </View>
      {showCompletionRate && stats.total > 0 && (
        <View className="mt-4 border-t border-border pt-4">
          <Text className="text-muted-foreground">
            Taxa de Conclusão:{" "}
            {Math.round((stats.completed / stats.total) * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
}
