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
};