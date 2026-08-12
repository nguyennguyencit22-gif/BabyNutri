import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BookmarkState {
  savedArticleIds: number[];
  savedRecipeIds: number[];
  toggleBookmarkArticle: (articleId: number) => boolean;
  toggleBookmarkRecipe: (recipeId: number) => boolean;
  isArticleSaved: (articleId: number) => boolean;
  isRecipeSaved: (recipeId: number) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      savedArticleIds: [],
      savedRecipeIds: [],

      toggleBookmarkArticle: (articleId: number) => {
        const { savedArticleIds } = get();
        const isSaved = savedArticleIds.includes(articleId);
        const updated = isSaved
          ? savedArticleIds.filter((id) => id !== articleId)
          : [...savedArticleIds, articleId];

        set({ savedArticleIds: updated });
        return !isSaved;
      },

      toggleBookmarkRecipe: (recipeId: number) => {
        const { savedRecipeIds } = get();
        const isSaved = savedRecipeIds.includes(recipeId);
        const updated = isSaved
          ? savedRecipeIds.filter((id) => id !== recipeId)
          : [...savedRecipeIds, recipeId];

        set({ savedRecipeIds: updated });
        return !isSaved;
      },

      isArticleSaved: (articleId: number) => {
        return get().savedArticleIds.includes(articleId);
      },

      isRecipeSaved: (recipeId: number) => {
        return get().savedRecipeIds.includes(recipeId);
      },
    }),
    {
      name: 'babynutri-bookmarks-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
