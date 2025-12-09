import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

interface StatsCardProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    notCompleted: number;
  };
}

export function StatsCard({ stats }: StatsCardProps) {
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
    <Card>
      <View className="flex-row flex-wrap">
        {/* Total */}
        <View className="w-1/2 p-4">
          <Text size="sm" className="text-muted-foreground mb-1">
            Total
          </Text>
          <Text className="text-2xl font-bold">{stats.total}</Text>
        </View>
        
        {/* Completos */}
        <View className="w-1/2 p-4">
          <Text size="sm" className="text-muted-foreground mb-1">
            Completos
          </Text>
          <Text className={`text-2xl font-bold ${getStatusColor("completed")}`}>
            {stats.completed}
          </Text>
        </View>
        
        {/* Pendentes */}
        <View className="w-1/2 p-4">
          <Text size="sm" className="text-muted-foreground mb-1">
            Pendentes
          </Text>
          <Text className={`text-2xl font-bold ${getStatusColor("pending")}`}>
            {stats.pending}
          </Text>
        </View>
        
        {/* Incompletos */}
        <View className="w-1/2 p-4">
          <Text size="sm" className="text-muted-foreground mb-1">
            Incompletos
          </Text>
          <Text className={`text-2xl font-bold ${getStatusColor("notCompleted")}`}>
            {stats.notCompleted}
          </Text>
        </View>
      </View>
    </Card>
  );
}