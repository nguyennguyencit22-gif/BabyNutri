export interface Meal {
  id: string;
  name: string;
  time: string; // e.g. "08:00 AM"
  description: string;
  calories: number;
}

export interface MealPlan {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  meals: Meal[];
  totalCalories: number;
  createdAt?: string;
  updatedAt?: string;
}
