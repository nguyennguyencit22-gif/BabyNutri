import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { Article, ArticleListItem } from '../types/article';

const BASE = '/articles';
const ASYNC_STORAGE_KEY = '@babynutri_articles_v2';

let inMemoryArticles: (ArticleListItem & { content?: string })[] = [];

// Helper to save articles to AsyncStorage
const persistToStorage = async (articles: (ArticleListItem & { content?: string })[]) => {
  try {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error('Failed to persist articles to AsyncStorage:', e);
  }
};

// Helper to load articles from AsyncStorage on startup
const loadFromStorage = async (): Promise<(ArticleListItem & { content?: string })[]> => {
  try {
    const json = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load articles from AsyncStorage:', e);
  }
  return [];
};

// Immediately load persisted articles into memory
loadFromStorage().then(saved => {
  if (saved && saved.length > 0) {
    inMemoryArticles = saved;
  }
});

export const articleService = {
  getAll: async (): Promise<ArticleListItem[]> => {
    try {
      const res = await api.get(BASE);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      console.warn('Backend API unavailable, returning persisted user articles:', e);
    }

    if (inMemoryArticles.length === 0) {
      const loaded = await loadFromStorage();
      if (loaded.length > 0) {
        inMemoryArticles = loaded;
      }
    }

    return inMemoryArticles;
  },

  getById: async (id: number): Promise<Article> => {
    try {
      const res = await api.get(`${BASE}/${id}`);
      if (res.data) return res.data;
    } catch (e) {
      console.warn('Backend API unavailable, fetching article details from local state:', e);
    }

    if (inMemoryArticles.length === 0) {
      inMemoryArticles = await loadFromStorage();
    }

    const found = inMemoryArticles.find(a => a.id === id) || inMemoryArticles[0] || {
      id: id,
      title: 'Article Post',
      summary: '',
      content: '',
      image_url: '',
      author: 'Parent',
      published_date: new Date().toISOString(),
    };

    return {
      id: found.id,
      expert_id: 1,
      title: found.title,
      summary: found.summary,
      content: found.content || found.summary || '',
      image_url: found.image_url,
      author: found.author,
      published_date: found.published_date,
    };
  },

  create: async (data: { title: string; summary?: string; content: string; imageUrl?: string; published_date?: string; author?: string }): Promise<{ id: number; published_date?: string; author?: string }> => {
    const newId = Date.now();
    const newArticle: ArticleListItem & { content?: string } = {
      id: newId,
      title: data.title,
      summary: data.summary || data.content.slice(0, 100),
      content: data.content,
      image_url: data.imageUrl || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500',
      author: data.author || 'Parent',
      published_date: data.published_date || new Date().toISOString(),
    };

    inMemoryArticles = [newArticle, ...inMemoryArticles];
    await persistToStorage(inMemoryArticles);

    try {
      const res = await api.post(BASE, data);
      if (res.data) return res.data;
    } catch (e) {
      console.warn('Backend save article error, article persisted locally:', e);
    }

    return { id: newId, published_date: newArticle.published_date || undefined, author: newArticle.author || undefined };
  },

  update: async (id: number, data: { title?: string; summary?: string; content?: string; imageUrl?: string; author?: string }): Promise<void> => {
    inMemoryArticles = inMemoryArticles.map(a => a.id === id ? { ...a, ...data } : a);
    await persistToStorage(inMemoryArticles);

    try {
      await api.put(`${BASE}/${id}`, data);
    } catch (e) {
      console.warn('Backend update error:', e);
    }
  },

  remove: async (id: number): Promise<void> => {
    inMemoryArticles = inMemoryArticles.filter(a => a.id !== id);
    await persistToStorage(inMemoryArticles);

    try {
      await api.delete(`${BASE}/${id}`);
    } catch (e) {
      console.warn('Backend delete error:', e);
    }
  },

  getMine: async (): Promise<ArticleListItem[]> => {
    const res = await api.get(`${BASE}/mine`);
    return res.data;
  },
};