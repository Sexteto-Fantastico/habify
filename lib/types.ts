export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Habit {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  frequency: HabitFrequency;
  tags: Tag[];
  completions: HabitCompletion[];
}

export interface HabitCompletion {
  id: number;
  habitId: number;
  date: Date;
  completed: boolean;
}

export interface HabitStats {
  total: number;
  completed: number;
  pending: number;
  notCompleted: number;
}

export interface HabitFilter {
  createdDate: Date;
}
