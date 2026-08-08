import { create } from 'zustand';
import { ArticleListItem } from '../types/article';
import { articleService } from '../services/article.service';

interface ArticleState {
  articles: ArticleListItem[];
  loading: boolean;
  likedArticleIds: number[];
  fetchArticles: () => Promise<void>;
  toggleLikeArticle: (articleId: number) => void;
  deleteArticleOptimistic: (articleId: number) => Promise<void>;
  addArticleOptimistic: (newArticle: ArticleListItem) => void;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  loading: false,
  likedArticleIds: [],

  fetchArticles: async () => {
    set({ loading: true });
    try {
      const data = await articleService.getAll();
      set({ articles: data });
    } catch (e) {
      console.error('Fetch articles store error:', e);
    } finally {
      set({ loading: false });
    }
  },

  toggleLikeArticle: (articleId: number) => {
    const { likedArticleIds } = get();
    const isLiked = likedArticleIds.includes(articleId);
    const updated = isLiked
      ? likedArticleIds.filter((id) => id !== articleId)
      : [...likedArticleIds, articleId];

    set({ likedArticleIds: updated });
  },

  deleteArticleOptimistic: async (articleId: number) => {
    const currentArticles = get().articles;
    set({ articles: currentArticles.filter((a) => a.id !== articleId) });
    try {
      await articleService.remove(articleId);
    } catch (e) {
      console.error('Delete article store error:', e);
      set({ articles: currentArticles });
    }
  },

  addArticleOptimistic: (newArticle: ArticleListItem) => {
    set({ articles: [newArticle, ...get().articles] });
  },
}));
