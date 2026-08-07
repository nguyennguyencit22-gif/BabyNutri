import { MealPlan, Meal } from '../types/meal-plan';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

// Helper to format date string YYYY-MM-DD in local timezone
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Generate default mock meal plans for the current week dynamically
const generateMockMealPlans = (childId: string = '1'): MealPlan[] => {
  const today = new Date();
  const currentDay = today.getDay();
  const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));

  const plans: MealPlan[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatDate(d);

    plans.push({
      id: `plan-${i + 1}`,
      childId: childId,
      date: dateStr,
      totalCalories: 600,
      totalProtein: 22.2,
      totalFat: 12.3,
      totalCarbs: 76.0,
      meals: [
        {
          id: `m-${i}-1`,
          name: 'Breakfast',
          time: '08:00 AM',
          description: 'Nutritious pumpkin & pork porridge rich in dietary fibers',
          calories: 220,
          recipeId: 1,
          recipeImage: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500',
          protein: 8.5,
          fat: 4.2,
          carbs: 32.0,
        },
        {
          id: `m-${i}-2`,
          name: 'Lunch',
          time: '11:30 AM',
          description: 'Fresh shrimp & carrot soup supporting eyesight & immunity',
          calories: 180,
          recipeId: 2,
          recipeImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500',
          protein: 10.2,
          fat: 3.1,
          carbs: 24.0,
        },
        {
          id: `m-${i}-3`,
          name: 'Snack',
          time: '03:00 PM',
          description: 'Banana avocado yogurt smoothie easy to digest',
          calories: 140,
          recipeId: 3,
          recipeImage: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500',
          protein: 3.5,
          fat: 5.0,
          carbs: 20.0,
        },
        {
          id: `m-${i}-4`,
          name: 'Dinner',
          time: '06:00 PM',
          description: 'Salmon potato oatmeal porridge loaded with Omega-3 & DHA',
          calories: 260,
          recipeId: 4,
          recipeImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
          protein: 12.0,
          fat: 6.8,
          carbs: 35.0,
        },
      ],
    });
  }

  return plans;
};

// Local storage cache for mock fallback
let inMemoryMealPlans: MealPlan[] = generateMockMealPlans();

export const mealPlanService = {
  getMealPlans: async (childId?: string): Promise<MealPlan[]> => {
    try {
      let url = `${BASE_URL}/mealplans`;
      if (childId) {
        url += `?childId=${childId}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch meal plans');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return inMemoryMealPlans;
    } catch (error) {
      console.warn('Backend API unavailable, using mock meal plan data:', error);
      return inMemoryMealPlans;
    }
  },

  getMealPlanById: async (id: string): Promise<MealPlan | undefined> => {
    try {
      const response = await fetch(`${BASE_URL}/mealplans/${id}`);
      if (!response.ok) throw new Error('Failed to fetch meal plan details');
      return await response.json();
    } catch (error) {
      console.warn('Backend API unavailable, fetching meal plan from memory:', error);
      return inMemoryMealPlans.find(plan => plan.id === id || plan.date === id);
    }
  },

  getMealPlanByDate: async (dateStr: string): Promise<MealPlan | undefined> => {
    const plans = await mealPlanService.getMealPlans();
    return plans.find(plan => plan.date === dateStr);
  },

  createMealPlan: async (mealPlanData: Omit<MealPlan, 'id' | 'createdAt'>): Promise<MealPlan> => {
    const newPlan: MealPlan = {
      ...mealPlanData,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const existingIndex = inMemoryMealPlans.findIndex(p => p.date === newPlan.date);
    if (existingIndex >= 0) {
      inMemoryMealPlans[existingIndex] = newPlan;
    } else {
      inMemoryMealPlans.push(newPlan);
    }

    try {
      const response = await fetch(`${BASE_URL}/mealplans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealPlanData),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Backend save meal plan error, using in-memory updated plan:', e);
    }

    return newPlan;
  },

  addRecipeToMealPlan: async (params: {
    childId?: string;
    dateStr: string;
    mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
    recipe: { id: number; name: string; calories: number; image_url?: string; protein?: number; fat?: number; carbohydrate?: number; description?: string };
  }): Promise<MealPlan> => {
    const { childId = '1', dateStr, mealType, recipe } = params;
    let existingPlan = inMemoryMealPlans.find(p => p.date === dateStr);

    const timesMap: Record<string, string> = {
      Breakfast: '08:00 AM',
      Lunch: '11:30 AM',
      Snack: '03:00 PM',
      Dinner: '06:00 PM',
    };

    const newMeal: Meal = {
      id: `m-${Date.now()}`,
      name: `${mealType}: ${recipe.name}`,
      time: timesMap[mealType] || '08:00 AM',
      description: recipe.description || `Weaning recipe dish for ${mealType}`,
      calories: recipe.calories,
      recipeId: recipe.id,
      recipeImage: recipe.image_url,
      protein: recipe.protein || 8,
      fat: recipe.fat || 4,
      carbs: recipe.carbohydrate || 25,
    };

    if (existingPlan) {
      const updatedMeals = existingPlan.meals.filter(m => !m.name.startsWith(mealType));
      updatedMeals.push(newMeal);
      existingPlan.meals = updatedMeals;
      existingPlan.totalCalories = updatedMeals.reduce((sum, m) => sum + m.calories, 0);
      return existingPlan;
    } else {
      const newPlan: MealPlan = {
        id: `plan-${Date.now()}`,
        childId,
        date: dateStr,
        totalCalories: recipe.calories,
        totalProtein: recipe.protein || 8,
        totalFat: recipe.fat || 4,
        totalCarbs: recipe.carbohydrate || 25,
        meals: [newMeal],
      };
      inMemoryMealPlans.push(newPlan);
      return newPlan;
    }
  },

  updateMealPlan: async (id: string, mealPlanData: Partial<MealPlan>): Promise<MealPlan> => {
    const existingIndex = inMemoryMealPlans.findIndex(p => p.id === id || p.date === id);
    if (existingIndex >= 0) {
      inMemoryMealPlans[existingIndex] = {
        ...inMemoryMealPlans[existingIndex],
        ...mealPlanData,
        updatedAt: new Date().toISOString(),
      };
      return inMemoryMealPlans[existingIndex];
    }
    throw new Error('Meal plan not found');
  },

  deleteMealPlan: async (id: string): Promise<boolean> => {
    inMemoryMealPlans = inMemoryMealPlans.filter(p => p.id !== id);
    return true;
  },
};
