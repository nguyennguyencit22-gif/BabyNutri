import { apiGet, apiPost } from './api';

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
