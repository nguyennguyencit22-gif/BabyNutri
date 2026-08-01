import { create } from 'zustand';
import { RecipeListItem } from '../types/recipe';
import { recipeService } from '../services/recipe.service';

interface RecipeState {
  recipes: RecipeListItem[];
  loading: boolean;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  fetchRecipes: () => Promise<void>;
  deleteRecipeOptimistic: (recipeId: number) => Promise<void>;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  loading: false,
  selectedCategory: 'Tất cả',

  setSelectedCategory: (category: string) => set({ selectedCategory: category }),

  fetchRecipes: async () => {
    set({ loading: true });
    try {
      const data = await recipeService.getAll();
      set({ recipes: data });
    } catch (e) {
      console.error('Fetch recipes store error:', e);
    } finally {
      set({ loading: false });
    }
  },

  deleteRecipeOptimistic: async (recipeId: number) => {
    const currentRecipes = get().recipes;
    set({ recipes: currentRecipes.filter((r) => r.id !== recipeId) });
    try {
      await recipeService.remove(recipeId);
    } catch (e) {
      console.error('Delete recipe store error:', e);
      set({ recipes: currentRecipes });
    }
  },
}));
