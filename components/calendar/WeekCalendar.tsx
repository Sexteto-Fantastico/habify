import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { cn } from "@/lib/utils";
import { HStack } from "../ui/hstack";
import { Box } from "../ui/box";
import { Button, ButtonIcon } from "../ui/button";

interface Day {
  date: Date;
  dayOfMonth: number;
  dayOfWeek: string;
  isToday: boolean;
  isSelected: boolean;
}

interface WeekCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WeekCalendar = ({ selectedDate, onDateSelect }: WeekCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState<Day[]>([]);

  const generateWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const week: Day[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);

      week.push({
        date: currentDate,
        dayOfMonth: currentDate.getDate(),
        dayOfWeek: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][
          currentDate.getDay()
        ],
        isToday: isToday(currentDate),
        isSelected: isSameDay(currentDate, selectedDate),
      });
    }
    return week;
  };

  useEffect(() => {
    setCurrentWeek(generateWeek(selectedDate));
  }, [selectedDate]);

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 7 : -7));
    onDateSelect(newDate);
  };

  return (
    <Card className="m-1">
      <Box className="flex-row justify-between items-center mb-4">
        <Button
          size="sm"
          variant="outline"
          action="secondary"
          onPress={() => navigateWeek("prev")}
        >
          <ButtonIcon as={ArrowLeft} />
        </Button>

        <Text size="xl" className="font-medium">
          {selectedDate.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <Button
          size="sm"
          variant="outline"
          action="secondary"
          onPress={() => navigateWeek("next")}
        >
          <ButtonIcon as={ArrowRight} />
        </Button>
      </Box>

      <HStack className="items-center w-full">
        {currentWeek.map((day, index) => (
          <Pressable
            key={index}
            onPress={() => handleDateSelect(day.date)}
            className={cn(
              "flex-1 mx-1 items-center py-3 rounded-xl",
              day.isSelected ? "bg-primary-500" : "bg-background-100",
              day.isToday && "border-2 border-primary-500",
            )}
          >
            <Text
              className={cn(
                "text-xs font-medium",
                day.isSelected && "text-typography-0",
              )}
            >
              {day.dayOfWeek}
            </Text>
            <Text
              className={cn(
                "font-bold text-lg",
                day.isSelected && "text-typography-0",
                day.isToday && !day.isSelected && "text-primary-500",
              )}
            >
              {day.dayOfMonth}
            </Text>
          </Pressable>
        ))}
      </HStack>
    </Card>
  );
};

export default WeekCalendar;
