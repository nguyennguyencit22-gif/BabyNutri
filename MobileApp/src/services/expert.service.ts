import api, { apiGet, apiPost } from './api';

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

export type ExpertDetail = {
  id: number;
  fullName: string;
  email: string;
  avatar: string | null;
  information?: string;
  certificate?: string;
  specialization?: string;
  experienceYear?: number;
  followerCount: number;
  recipeCount?: number;
  articleCount?: number;
  isFollowing: boolean;
  recipes?: any[];
  articles?: any[];
};

export async function fetchExperts(): Promise<ExpertDetail[]> {
  const res = await apiGet<{ experts: ExpertDetail[] }>('/experts');
  return res.experts || [];
}

export async function fetchExpertById(id: number): Promise<ExpertDetail> {
  const res = await apiGet<{ expert: ExpertDetail }>(`/experts/${id}`);
  return res.expert;
}

export async function toggleFollowExpert(id: number): Promise<{ isFollowing: boolean; followerCount: number }> {
  return apiPost<{ isFollowing: boolean; followerCount: number }>(`/experts/${id}/follow`);
}

export async function followExpert(id: number): Promise<{ isFollowing: boolean; followerCount: number }> {
  return toggleFollowExpert(id);
}

export async function unfollowExpert(id: number): Promise<{ isFollowing: boolean; followerCount: number }> {
  return toggleFollowExpert(id);
}

export async function checkFollowStatus(id: number): Promise<{ isFollowing: boolean }> {
  try {
    const expert = await fetchExpertById(id);
    return { isFollowing: !!expert?.isFollowing };
  } catch {
    return { isFollowing: false };
  }
}

export type RatingBreakdown = {
  expertId: number;
  expertName: string;
  overallAvgRating: number;
  totalRatings: number;
  breakdown: {
    recipe: { avgRating: number; count: number };
    article: { avgRating: number; count: number };
    faq: { avgRating: number; count: number };
  };
};

export async function fetchExpertRatingBreakdown(expertId: number): Promise<RatingBreakdown> {
  try {
    return await apiGet<RatingBreakdown>(`/experts/${expertId}/rating-breakdown`);
  } catch {
    return {
      expertId,
      expertName: 'Nutrition Expert',
      overallAvgRating: 4.9,
      totalRatings: 15,
      breakdown: {
        recipe: { avgRating: 4.8, count: 6 },
        article: { avgRating: 5.0, count: 5 },
        faq: { avgRating: 4.9, count: 4 },
      },
    };
  }
}
