import { Question } from '../types/question';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const DEFAULT_FAQS: Question[] = [
  {
    id: 'faq-1',
    title: 'When is the best age to start weaning for babies?',
    content: 'According to WHO & Pediatric Nutritionists, the recommended age to start weaning is around 6 months (180 days). Babies should show readiness signs like sitting up steadily, opening mouth when offered food, and loss of tongue-thrust reflex.',
    category: 'Weaning',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faq-2',
    title: 'Should I add salt or sugar to weaning baby porridge?',
    content: 'No. Babies under 12 months should NOT have added salt or refined sugar. Their kidneys are immature and cannot process extra sodium. Natural flavors from vegetables, meat, fish, and fruits are ideal.',
    category: 'Nutrition',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faq-3',
    title: 'How to detect food allergy when introducing new ingredients?',
    content: 'Follow the 3-day rule: Introduce one single new food for 3 consecutive days while monitoring for allergic reactions such as skin rashes, vomiting, hives, swollen lips, or diarrhea before offering another new food.',
    category: 'Allergies',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faq-4',
    title: 'How much milk and solid food should a 7-8 month baby take daily?',
    content: 'At 7-8 months, breastmilk or formula remains the main source of nutrition (approx. 600-800ml daily). Solids should be offered 2 meals per day (approx. 1/2 to 3/4 bowl of porridge per meal).',
    category: 'Schedules',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faq-5',
    title: 'What to do if baby refuses to eat solid food or spits out porridge?',
    content: 'Do not force feed. Check if the texture is too thick or coarse for their stage. Offer small spoonfuls when baby is relaxed, not overly tired or starving, and create a positive mealtime environment.',
    category: 'Weaning',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faq-6',
    title: 'Which iron-rich foods are best for 6+ month weaning babies?',
    content: 'Iron stores deplete around 6 months. Great iron-rich weaning options include beef puree, chicken liver, egg yolk (well cooked), spinach, lentils, and iron-fortified baby cereals.',
    category: 'Nutrition',
    createdAt: new Date().toISOString(),
  },
];

export const questionService = {
  getQuestions: async (): Promise<Question[]> => {
    try {
      const response = await fetch(`${BASE_URL}/questions`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      console.warn('Backend API unavailable, using standard nutrition FAQ data');
    }
    return DEFAULT_FAQS;
  }
};
