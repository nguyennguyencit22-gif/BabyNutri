import { MealPlan } from '../types/meal-plan';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

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
      return await response.json();
    } catch (error) {
      console.error(error);
      return undefined;
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
