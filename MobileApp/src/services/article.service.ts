import api from './api';
import { Article, ArticleListItem } from '../types/article';

const BASE = '/articles';

export const articleService = {
  getAll: async (): Promise<ArticleListItem[]> => {
    const res = await api.get(BASE);
    return res.data;
  },
  getById: async (id: number): Promise<Article> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },
  create: async (data: { title: string; summary?: string; content: string; imageUrl?: string }): Promise<{ id: number }> => {
    const res = await api.post(BASE, data);
    return res.data;
  },
  update: async (id: number, data: { title?: string; summary?: string; content?: string; imageUrl?: string }): Promise<void> => {
    await api.put(`${BASE}/${id}`, data);
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};