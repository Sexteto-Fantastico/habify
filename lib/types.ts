export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface Habit {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  frequency: HabitFrequency;
  tags: Tag[];
  completions: HabitCompletion[];
}

export interface HabitCompletion {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
}

export interface HabitStats {
  total: number;
  completed: number;
  pending: number;
  notCompleted: number;
}
