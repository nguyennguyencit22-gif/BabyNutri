import api from './api';
import {
  Recipe,
  RecipeListItem,
  CreateRecipeDTO,
  UpdateRecipeDTO,
  RecipeSearchParams,
} from '../types/recipe';

const BASE = '/recipes';

export type RatingBreakdown = { 5: number; 4: number; 3: number; 2: number; 1: number };

export type RecipeComment = {
  id: number;
  userId: number;
  userName: string;
  avatar: string | null;
  content: string;
  createdAt: string;
};

export type MyRecipeItem = RecipeListItem & {
  avgRating: number;
  ratingCount: number;
  ratingCountThisMonth: number;
  commentCount: number;
  created_at: string;
};

export type RecipeMetadata = {
  mealTypes: { id: number; name: string }[];
  weaningMethods: { id: number; name: string }[];
  dietaryNeeds: { id: number; name: string }[];
  occasions: { id: number; name: string }[];
  ageRanges: string[];
};

export const recipeService = {
  getMeta: async (): Promise<RecipeMetadata> => {
    try {
      const res = await api.get(`${BASE}/meta`);
      return res.data;
    } catch {
      return {
        mealTypes: [
          { id: 1, name: 'Breakfast' }, { id: 2, name: 'Lunch' },
          { id: 3, name: 'Dinner' }, { id: 4, name: 'Snack' },
        ],
        weaningMethods: [
          { id: 1, name: 'Puree' }, { id: 2, name: 'Mashed' },
          { id: 3, name: 'Baby-Led Weaning' }, { id: 4, name: 'Finger Food' },
        ],
        dietaryNeeds: [
          { id: 1, name: 'Dairy-Free' }, { id: 2, name: 'Gluten-Free' },
          { id: 3, name: 'Egg-Free' }, { id: 4, name: 'Nut-Free' }, { id: 5, name: 'Vegetarian' },
        ],
        occasions: [
          { id: 1, name: 'Everyday' }, { id: 2, name: 'First Foods' },
          { id: 3, name: 'Meal Prep' }, { id: 4, name: 'On-the-Go' }, { id: 5, name: 'Special Occasion' },
        ],
        ageRanges: ['0-6 months', '6-12 months', '12-24 months', '24+ months'],
      };
    }
  },
  getAll: async (): Promise<RecipeListItem[]> => {
    const res = await api.get(BASE);
    return res.data;
  },
  getById: async (id: number): Promise<Recipe> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },
  create: async (data: CreateRecipeDTO): Promise<{ id: number }> => {
    const res = await api.post(BASE, data);
    return res.data;
  },
  update: async (id: number, data: UpdateRecipeDTO): Promise<void> => {
    await api.put(`${BASE}/${id}`, data);
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
  search: async (params: RecipeSearchParams): Promise<RecipeListItem[]> => {
    const res = await api.get(`${BASE}/search`, { params });
    return res.data;
  },
  getRatingSummary: async (id: number): Promise<{ totalRatings: number; averageRating: number; breakdown: RatingBreakdown }> => {
    const res = await api.get(`${BASE}/${id}/rating-summary`);
    return res.data;
  },
  getMyRating: async (id: number): Promise<{ rating: number | null }> => {
    const res = await api.get(`${BASE}/${id}/my-rating`);
    return res.data;
  },
  submitRating: async (id: number, rating: number, review?: string): Promise<void> => {
    await api.post(`${BASE}/${id}/rating`, { rating, review });
  },
  toggleFavorite: async (id: number): Promise<{ favorited: boolean }> => {
    const res = await api.post(`${BASE}/${id}/favorite`);
    return res.data;
  },
  getMyFavorites: async (): Promise<number[]> => {
    const res = await api.get(`${BASE}/favorites/mine`);
    return res.data;
  },
  getComments: async (id: number): Promise<RecipeComment[]> => {
    const res = await api.get(`${BASE}/${id}/comments`);
    return res.data;
  },
  addComment: async (id: number, content: string): Promise<{ id: number }> => {
    const res = await api.post(`${BASE}/${id}/comments`, { content });
    return res.data;
  },
  deleteComment: async (id: number, commentId: number): Promise<void> => {
    await api.delete(`${BASE}/${id}/comments/${commentId}`);
  },
  getMine: async (): Promise<MyRecipeItem[]> => {
    const res = await api.get(`${BASE}/mine`);
    return res.data.map((r: any) => ({
      ...r,
      avgRating: Number(r.avgRating) || 0,
      ratingCount: Number(r.ratingCount) || 0,
      ratingCountThisMonth: Number(r.ratingCountThisMonth) || 0,
      commentCount: Number(r.commentCount) || 0,
    }));
  },
  getRecommendations: async (monthAge: number, allergies: string[]): Promise<{ babyAgeMonths: number; recommendations: RecipeListItem[] }> => {
    const res = await api.post(`${BASE}/recommend`, { monthAge, allergies });
    return res.data;
  },
};