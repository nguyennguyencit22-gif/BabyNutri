import api from './api';

const BASE = '/chat';

export type ChatExpert = {
  id: number;
  name: string;
  role: string | null;
  image: string | null;
};

export type ChatConversation = {
  id: number;
  status: 'active' | 'ended';
  lastMessage: string | null;
  lastMessageAt: string;
  createdAt: string;
  parentId: number;
  parentName: string;
  parentAvatar: string | null;
  expertId: number;
  expertName: string;
  expertAvatar: string | null;
};

export type ChatMessage = {
  id: number;
  senderId: number;
  content: string;
  createdAt: string;
};

export type ChatFeedbackSummary = {
  totalRatings: number;
  avgRating: number;
  ratingsThisMonth: number;
};

export const chatService = {
  getExperts: async (): Promise<ChatExpert[]> => {
    const res = await api.get(`${BASE}/experts`);
    return res.data;
  },
  startConversation: async (expertId: number): Promise<{ id: number }> => {
    const res = await api.post(`${BASE}/conversations`, { expertId });
    return res.data;
  },
  getMyConversations: async (): Promise<ChatConversation[]> => {
    const res = await api.get(`${BASE}/conversations`);
    return res.data;
  },
  getMessages: async (conversationId: number): Promise<ChatMessage[]> => {
    const res = await api.get(`${BASE}/conversations/${conversationId}/messages`);
    return res.data;
  },
  sendMessage: async (conversationId: number, content: string): Promise<ChatMessage> => {
    const res = await api.post(`${BASE}/conversations/${conversationId}/messages`, { content });
    return res.data;
  },
  endConversation: async (conversationId: number): Promise<void> => {
    await api.post(`${BASE}/conversations/${conversationId}/end`);
  },
  rateConversation: async (conversationId: number, rating: number, review?: string): Promise<void> => {
    await api.post(`${BASE}/conversations/${conversationId}/rating`, { rating, review });
  },
  getMyFeedback: async (): Promise<ChatFeedbackSummary> => {
    const res = await api.get(`${BASE}/feedback/mine`);
    return {
      totalRatings: Number(res.data.totalRatings) || 0,
      avgRating: Number(res.data.avgRating) || 0,
      ratingsThisMonth: Number(res.data.ratingsThisMonth) || 0,
    };
  },
};
