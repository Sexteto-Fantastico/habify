import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { Box } from "../ui/box";

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
      <Box className="flex-row">
        <Box className="flex-1 flex-col items-center">
          <Text size="xl" className="font-bold">
            {stats.total}
          </Text>
          <Text size="sm" className="text-typography-500">
            Total
          </Text>
        </Box>
        <Box className="flex-1 flex-col items-center">
          <Text
            size="xl"
            className={`font-bold ${getStatusColor("completed")}`}
          >
            {stats.completed}
          </Text>
          <Text size="sm" className="text-typography-500">
            Completos
          </Text>
        </Box>
        <Box className="flex-1 flex-col items-center">
          <Text size="xl" className={`font-bold ${getStatusColor("pending")}`}>
            {stats.pending}
          </Text>
          <Text size="sm" className="text-typography-500">
            Pendentes
          </Text>
        </Box>
        <Box className="flex-1 flex-col items-center">
          <Text
            size="xl"
            className={`font-bold ${getStatusColor("notCompleted")}`}
          >
            {stats.notCompleted}
          </Text>
          <Text size="sm" className="text-typography-500">
            Incompletos
          </Text>
        </Box>
      </Box>
    </Card>
  );
}
