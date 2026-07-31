import { Question } from '../types/question';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export const questionService = {
  getQuestions: async (): Promise<Question[]> => {
    try {
      const response = await fetch(`${BASE_URL}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }
};
