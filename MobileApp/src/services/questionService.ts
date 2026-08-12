import { apiGet, apiPost, apiDelete } from './api';

export type QuestionAnswer = {
    id?: string;
    content: string;
    expertName: string;
    answeredAt?: string;
};

export type QuestionItem = {
    id: string;
    title: string;
    content: string;
    category?: string;
    status: 'Pending' | 'Answered';
    createdAt: string;
    parentName?: string;
    targetExpertId?: string | null;
    targetExpertName?: string | null;
    answer?: QuestionAnswer | null;
};

export type PublicExpert = {
    id: number;
    fullName: string;
    specialization?: string;
};

const DEFAULT_FAQS: QuestionItem[] = [
  {
    id: 'faq-1',
    title: 'When is the best age to start weaning for babies?',
    content: 'According to WHO & Pediatric Nutritionists, the recommended age to start weaning is around 6 months (180 days). Babies should show readiness signs like sitting up steadily, opening mouth when offered food, and loss of tongue-thrust reflex.',
    category: 'Weaning',
    status: 'Answered',
    createdAt: new Date().toISOString(),
    answer: {
        content: 'Around 6 months is ideal. Look for sitting up with support and loss of tongue-thrust reflex.',
        expertName: 'Dr. Troyan Smith'
    }
  },
  {
    id: 'faq-2',
    title: 'Should I add salt or sugar to weaning baby porridge?',
    content: 'No. Babies under 12 months should NOT have added salt or refined sugar. Their kidneys are immature and cannot process extra sodium. Natural flavors from vegetables, meat, fish, and fruits are ideal.',
    category: 'Nutrition',
    status: 'Answered',
    createdAt: new Date().toISOString(),
    answer: {
        content: 'Avoid all added salt and sugar under 12 months to protect immature kidneys.',
        expertName: 'Dr. James Wolden'
    }
  },
  {
    id: 'faq-3',
    title: 'How to detect food allergy when introducing new ingredients?',
    content: 'Follow the 3-day rule: Introduce one single new food for 3 consecutive days while monitoring for allergic reactions such as skin rashes, vomiting, hives, swollen lips, or diarrhea before offering another new food.',
    category: 'Allergies',
    status: 'Answered',
    createdAt: new Date().toISOString(),
    answer: {
        content: 'Use the 3-day rule for each new ingredient to easily identify allergies.',
        expertName: 'Dr. Niki Samantha'
    }
  },
  {
    id: 'faq-4',
    title: 'How much milk and solid food should a 7-8 month baby take daily?',
    content: 'At 7-8 months, breastmilk or formula remains the main source of nutrition (approx. 600-800ml daily). Solids should be offered 2 meals per day (approx. 1/2 to 3/4 bowl of porridge per meal).',
    category: 'Schedules',
    status: 'Answered',
    createdAt: new Date().toISOString(),
    answer: {
        content: 'Aim for 600-800ml milk plus 2 solid meals daily.',
        expertName: 'Dr. Khoa Nguyen'
    }
  }
];

export const questionService = {
  getQuestions: async (status?: string): Promise<QuestionItem[]> => {
    try {
      const url = status ? `/questions?status=${status}` : '/questions';
      const data = await apiGet<QuestionItem[]>(url);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      console.warn('Backend API unavailable, using standard nutrition FAQ data');
    }
    return DEFAULT_FAQS;
  },

  getMyQuestions: async (): Promise<QuestionItem[]> => {
    try {
      const data = await apiGet<QuestionItem[]>('/questions?myOnly=true');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  getPublicExperts: async (): Promise<PublicExpert[]> => {
    try {
      return await apiGet<PublicExpert[]>('/questions/public-experts');
    } catch {
      return [];
    }
  },

  createQuestion: async (title: string, content: string, expertId?: number | null): Promise<QuestionItem> => {
    const res = await apiPost<{ question: QuestionItem }>('/questions', { title, content, expertId });
    return res.question;
  },

  answerQuestion: async (questionId: string, content: string): Promise<any> => {
    return apiPost(`/questions/${questionId}/answer`, { content });
  },

  createFAQ: async (title: string, content: string, answer?: string): Promise<any> => {
    return apiPost('/questions/faq', { title, content, answer });
  },

  deleteQuestion: async (questionId: string): Promise<any> => {
    return apiDelete(`/questions/${questionId}`);
  }
};
