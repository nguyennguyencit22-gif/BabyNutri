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

export const recipeService = {
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
};