import { MealPlan } from '../types/meal-plan';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const mapMealName = (name: string) => {
  if (name === 'Breakfast') return 'Sáng';
  if (name === 'Lunch') return 'Trưa';
  if (name === 'Dinner') return 'Tối';
  if (name === 'Snack') return 'Chiều';
  return name;
};

export const mealPlanService = {
  getMealPlans: async (childId?: string): Promise<MealPlan[]> => {
    try {
      let url = `${BASE_URL}/mealplans`;
      if (childId) {
        url += `?childId=${childId}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch meal plans');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getMealPlanById: async (id: string): Promise<MealPlan | undefined> => {
    try {
      const response = await fetch(`${BASE_URL}/mealplans/${id}`);
      if (!response.ok) throw new Error('Failed to fetch meal plan details');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },

  getMealPlanForDate: async (dateStr: string, dayName: string): Promise<MealPlan | null> => {
    try {
      // Get all plans (should ideally filter by date range, but we just get the first one for now as per DB mock)
      const plans = await mealPlanService.getMealPlans();
      if (plans.length === 0) return null;

      // Get details of the first plan
      const planDetail = await mealPlanService.getMealPlanById(plans[0].id);
      if (!planDetail) return null;

      // Map dayName (T2, T3...) to English day_of_week
      const dayMap: { [key: string]: string } = {
        'T2': 'Monday', 'T3': 'Tuesday', 'T4': 'Wednesday',
        'T5': 'Thursday', 'T6': 'Friday', 'T7': 'Saturday', 'CN': 'Sunday'
      };
      const targetDayOfWeek = dayMap[dayName];

      // Filter meals by day_of_week and map properties
      const filteredMeals = planDetail.meals
        .filter((m: any) => m.day_of_week === targetDayOfWeek)
        .map((m: any) => ({
          ...m,
          name: m.description, // description holds recipe name from backend
          type: mapMealName(m.name), // name holds meal_type_name ('Breakfast')
          description: '' // optional
        }));

      return {
        ...planDetail,
        meals: filteredMeals
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  createMealPlan: async (mealPlanData: Omit<MealPlan, 'id' | 'createdAt'>): Promise<MealPlan> => {
    throw new Error("Method not implemented for real API yet");
  },

  updateMealPlan: async (id: string, mealPlanData: Partial<MealPlan>): Promise<MealPlan> => {
    throw new Error("Method not implemented for real API yet");
  },

  deleteMealPlan: async (id: string): Promise<boolean> => {
    throw new Error("Method not implemented for real API yet");
  }
};
