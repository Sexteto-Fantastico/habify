import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Box } from "../ui/box";
import { Grid, GridItem } from "../ui/grid";

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
      <Grid _extra={{ className: "grid-cols-2 gap-4" }}>
        <GridItem _extra={{ className: "col-span-1" }}>
          <Text>Total</Text>
          <Text className="text-2xl font-bold">{stats.total}</Text>
        </GridItem>
        <GridItem _extra={{ className: "col-span-1" }}>
          <Text>Completos</Text>
          <Text className={`text-2xl font-bold ${getStatusColor("completed")}`}>
            {stats.completed}
          </Text>
        </GridItem>
        <GridItem _extra={{ className: "col-span-1" }}>
          <Text>Pendentes</Text>
          <Text className={`text-2xl font-bold ${getStatusColor("pending")}`}>
            {stats.pending}
          </Text>
        </GridItem>
        <GridItem _extra={{ className: "col-span-1" }}>
          <Text>Incompletos</Text>
          <Text
            className={`text-2xl font-bold ${getStatusColor("notCompleted")}`}
          >
            {stats.notCompleted}
          </Text>
        </GridItem>
      </Grid>
    </Card>
  );
}
