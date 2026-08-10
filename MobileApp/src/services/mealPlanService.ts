import { MealPlan, Meal } from '../types/meal-plan';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const MEAL_PLANS_STORAGE_KEY = '@babynutri_meal_plans_persistent_v3';

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
      id: `plan-${childId}-${i + 1}`,
      childId: childId,
      date: dateStr,
      totalCalories: 600,
      totalProtein: 22.2,
      totalFat: 12.3,
      totalCarbs: 76.0,
      meals: [
        {
          id: `m-${childId}-${i}-1`,
          name: 'Breakfast: Pumpkin & Pork Porridge',
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
          id: `m-${childId}-${i}-2`,
          name: 'Lunch: Fresh Shrimp & Carrot Soup',
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
          id: `m-${childId}-${i}-3`,
          name: 'Snack: Banana Avocado Smoothie',
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
          id: `m-${childId}-${i}-4`,
          name: 'Dinner: Salmon Potato Oatmeal Porridge',
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

let inMemoryMealPlans: MealPlan[] | null = null;

const loadPersistedMealPlans = async (targetChildId: string = '1'): Promise<MealPlan[]> => {
  if (inMemoryMealPlans === null) {
    try {
      const raw = await AsyncStorage.getItem(MEAL_PLANS_STORAGE_KEY);
      if (raw) {
        inMemoryMealPlans = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('AsyncStorage load error:', e);
    }
  }

  if (inMemoryMealPlans === null) {
    inMemoryMealPlans = generateMockMealPlans(targetChildId);
    savePersistedMealPlans(inMemoryMealPlans);
  }

  const hasPlansForChild = inMemoryMealPlans.some(p => String(p.childId) === String(targetChildId));
  if (!hasPlansForChild) {
    const childMockPlans = generateMockMealPlans(targetChildId);
    inMemoryMealPlans.push(...childMockPlans);
    savePersistedMealPlans(inMemoryMealPlans);
  }

  return inMemoryMealPlans;
};

const savePersistedMealPlans = async (plans: MealPlan[]) => {
  inMemoryMealPlans = plans;
  try {
    await AsyncStorage.setItem(MEAL_PLANS_STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.warn('AsyncStorage save error:', e);
  }
};

export const mealPlanService = {
  getMealPlans: async (childId?: string): Promise<MealPlan[]> => {
    const targetChildId = childId || '1';
    try {
      let url = `${BASE_URL}/mealplans?childId=${targetChildId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch meal plans');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.filter((p: any) => String(p.childId) === String(targetChildId));
      }
    } catch (error) {
      console.warn('Backend API unavailable, using persistent local meal plan data:', error);
    }

    const plans = await loadPersistedMealPlans(targetChildId);
    return plans.filter(p => String(p.childId) === String(targetChildId));
  },

  getMealPlanById: async (id: string): Promise<MealPlan | undefined> => {
    try {
      const response = await fetch(`${BASE_URL}/mealplans/${id}`);
      if (!response.ok) throw new Error('Failed to fetch meal plan details');
      return await response.json();
    } catch (error) {
      console.warn('Backend API unavailable, fetching meal plan from persistent storage:', error);
      const plans = await loadPersistedMealPlans();
      return plans.find(plan => plan.id === id || plan.date === id);
    }
  },

  getMealPlanByDate: async (dateStr: string, childId?: string): Promise<MealPlan | undefined> => {
    const plans = await mealPlanService.getMealPlans(childId);
    return plans.find(plan => plan.date === dateStr);
  },

  createMealPlan: async (mealPlanData: Omit<MealPlan, 'id' | 'createdAt'>): Promise<MealPlan> => {
    const newPlan: MealPlan = {
      ...mealPlanData,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const plans = await loadPersistedMealPlans(String(newPlan.childId || '1'));
    const existingIndex = plans.findIndex(
      p => (String(p.childId) === String(newPlan.childId) || !p.childId) && p.date === newPlan.date
    );
    if (existingIndex >= 0) {
      plans[existingIndex] = newPlan;
    } else {
      plans.push(newPlan);
    }

    await savePersistedMealPlans(plans);

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
      console.warn('Backend save meal plan error, using persistent local updated plan:', e);
    }

    return newPlan;
  },

  addRecipeToMealPlan: async (params: {
    childId?: string;
    dateStr: string;
    mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
    customTime?: string;
    recipe: { id: number; name: string; calories: number; image_url?: string; protein?: number; fat?: number; carbohydrate?: number; description?: string };
  }): Promise<MealPlan> => {
    const { childId = '1', dateStr, mealType, customTime, recipe } = params;
    const plans = await loadPersistedMealPlans(childId);
    let existingPlan = plans.find(
      p => (String(p.childId) === String(childId) || !p.childId) && p.date === dateStr
    );

    // Prevent duplicate dish on the same day for this baby
    if (existingPlan) {
      const isDuplicate = existingPlan.meals.some(
        m => String(m.recipeId) === String(recipe.id) || m.name.endsWith(recipe.name)
      );
      if (isDuplicate) {
        throw new Error(`"${recipe.name}" is already added to this baby's schedule for this date!`);
      }
    }

    const finalTime = customTime || '';

    const newMeal: Meal = {
      id: `m-${Date.now()}`,
      name: `${mealType}: ${recipe.name}`,
      time: finalTime,
      description: recipe.description || `Weaning recipe dish for ${mealType}`,
      calories: recipe.calories,
      recipeId: recipe.id,
      recipeImage: recipe.image_url,
      protein: recipe.protein || 8,
      fat: recipe.fat || 4,
      carbs: recipe.carbohydrate || 25,
    };

    let resultPlan: MealPlan;
    if (existingPlan) {
      existingPlan.meals.push(newMeal);
      existingPlan.totalCalories = existingPlan.meals.reduce((sum, m) => sum + m.calories, 0);
      existingPlan.totalProtein = Number(existingPlan.meals.reduce((sum, m) => sum + (m.protein || 0), 0).toFixed(1));
      resultPlan = existingPlan;
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
      plans.push(newPlan);
      resultPlan = newPlan;
    }

    await savePersistedMealPlans(plans);
    return resultPlan;
  },

  removeDishFromMealPlan: async (params: {
    childId: string;
    dateStr: string;
    mealId: string | number;
  }): Promise<MealPlan | null> => {
    const { childId, dateStr, mealId } = params;
    const plans = await loadPersistedMealPlans(childId);
    const planIndex = plans.findIndex(
      p => (String(p.childId) === String(childId) || !p.childId) && p.date === dateStr
    );

    if (planIndex >= 0) {
      const plan = plans[planIndex];
      plan.meals = plan.meals.filter(
        m => String(m.id) !== String(mealId) && String(m.recipeId) !== String(mealId) && m.name !== String(mealId)
      );
      plan.totalCalories = plan.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
      plan.totalProtein = Number(plan.meals.reduce((sum, m) => sum + (m.protein || 0), 0).toFixed(1));
      plans[planIndex] = plan;

      await savePersistedMealPlans(plans);
      return plan;
    }
    return null;
  },

  updateMealPlan: async (id: string, mealPlanData: Partial<MealPlan>): Promise<MealPlan> => {
    const plans = await loadPersistedMealPlans();
    const existingIndex = plans.findIndex(p => p.id === id || p.date === id);
    if (existingIndex >= 0) {
      plans[existingIndex] = {
        ...plans[existingIndex],
        ...mealPlanData,
        updatedAt: new Date().toISOString(),
      };
      await savePersistedMealPlans(plans);
      return plans[existingIndex];
    }
    throw new Error('Meal plan not found');
  },

  deleteMealPlan: async (id: string): Promise<boolean> => {
    let plans = await loadPersistedMealPlans();
    plans = plans.filter(p => p.id !== id);
    await savePersistedMealPlans(plans);
    return true;
  },
};
