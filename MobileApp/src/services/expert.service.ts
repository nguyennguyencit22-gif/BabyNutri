import api from './api';

const BASE = '/experts';

export type ExpertProfile = {
  id: number;
  fullName: string;
  email: string;
  avatar: string | null;
  information: string | null;
  certificate: string | null;
  specialization: string | null;
  experienceYear: number | null;
  isVerified: boolean;
};

export type UpdateExpertProfileDTO = {
  information?: string;
  certificate?: string;
  specialization?: string;
  experienceYear?: number;
};

export const expertService = {
  getMyProfile: async (): Promise<ExpertProfile> => {
    const res = await api.get(`${BASE}/me`);
    return { ...res.data, isVerified: !!res.data.isVerified };
  },
  updateMyProfile: async (data: UpdateExpertProfileDTO): Promise<void> => {
    await api.put(`${BASE}/me`, data);
  },
};
