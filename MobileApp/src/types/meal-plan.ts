export interface Meal {
  id: string;
  name: string;
  time: string; // e.g. "08:00 AM"
  description: string;
  calories: number;
  recipeId?: number;
  recipeImage?: string;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface MealPlan {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  meals: Meal[];
  totalCalories: number;
  totalProtein?: number;
  totalFat?: number;
  totalCarbs?: number;
  createdAt?: string;
  updatedAt?: string;
}

