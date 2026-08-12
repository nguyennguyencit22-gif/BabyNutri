import api from './api';
import {
  Recipe,
  RecipeListItem,
  CreateRecipeDTO,
  UpdateRecipeDTO,
  RecipeSearchParams,
} from '../types/recipe';

const BASE = '/recipes';

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
};