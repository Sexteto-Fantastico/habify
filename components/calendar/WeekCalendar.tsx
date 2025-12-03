import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Motion } from "@legendapp/motion";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { Card } from "../ui/card";
import { Text } from "@/components/ui/text";

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
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          className="w-8 h-8 items-center justify-center bg-gray-100 rounded-full active:bg-gray-200"
          onPress={() => navigateWeek("prev")}
        >
          <ArrowLeft className="text-blue-500" />
        </TouchableOpacity>

        <Text size="2xl">
          {selectedDate.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity onPress={() => navigateWeek("next")}>
          <ArrowRight className="text-blue-500" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between">
        {currentWeek.map((day, index) => (
          <Motion.View
            key={index}
            className={`flex-1 mx-1 items-center py-3 rounded-xl ${
              day.isSelected ? "bg-blue-500" : "bg-gray-100"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <TouchableOpacity
              onPress={() => handleDateSelect(day.date)}
              className="items-center w-full"
            >
              <Text
                className={`text-xs font-medium ${
                  day.isSelected ? "text-white" : "text-gray-600"
                }`}
              >
                {day.dayOfWeek}
              </Text>
              <Text
                className={`text-base font-bold mt-1 ${
                  day.isSelected
                    ? "text-white"
                    : day.isToday
                      ? "text-blue-500"
                      : "text-gray-800"
                }`}
              >
                {day.dayOfMonth}
              </Text>
              {day.isToday && !day.isSelected && (
                <View className="w-1 h-1 bg-blue-500 rounded-full mt-1" />
              )}
            </TouchableOpacity>
          </Motion.View>
        ))}
      </View>
    </Card>
  );
};

export default WeekCalendar;
