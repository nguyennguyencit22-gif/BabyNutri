import { Child } from '../types/child';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export const childService = {
  getChildren: async (): Promise<Child[]> => {
    try {
      const response = await fetch(`${BASE_URL}/children`);
      if (!response.ok) throw new Error('Failed to fetch children');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getChildById: async (id: string): Promise<Child | undefined> => {
    try {
      const response = await fetch(`${BASE_URL}/children/${id}`);
      if (!response.ok) throw new Error('Failed to fetch child');
      return await response.json();
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },

  createChild: async (childData: Omit<Child, 'id' | 'createdAt'>): Promise<Child> => {
    const response = await fetch(`${BASE_URL}/children`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(childData),
    });
    if (!response.ok) throw new Error('Failed to create child');
    return await response.json();
  },

  updateChild: async (id: string, childData: Partial<Child>): Promise<Child> => {
    const response = await fetch(`${BASE_URL}/children/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(childData),
    });
    if (!response.ok) throw new Error('Failed to update child');
    return await response.json();
  },

  deleteChild: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/children/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};
