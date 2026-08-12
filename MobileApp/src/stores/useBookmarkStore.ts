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
  setSavedRecipeIds: (recipeIds: number[]) => void;
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

      // Called after login/on Favorites screen load to make the local
      // store reflect the signed-in user's favorites from the database
      // (the DB is the source of truth for an account; a guest's local
      // picks aren't merged in, matching the guest-data-is-local-only
      // behavior elsewhere in the app).
      setSavedRecipeIds: (recipeIds: number[]) => {
        set({ savedRecipeIds: recipeIds });
      },
    }),
    {
      name: 'babynutri-bookmarks-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
