import { apiGet, apiPost, apiDelete } from './api';

export type AdminExpertItem = {
    id: number;
    fullName: string;
    email: string;
    avatar: string | null;
    createdAt: string;
    information?: string;
    certificate?: string;
    specialization?: string;
    experienceYear?: number;
    isVerified?: boolean;
    temporaryPassword?: string;
};

export type CreateExpertData = {
    email: string;
    fullName: string;
    password?: string;
    information?: string;
    certificate?: string;
    specialization?: string;
    experienceYear?: number;
};

export type AdminReports = {
    totalUsers: number;
    totalParents: number;
    totalExperts: number;
    totalRecipes: number;
    totalArticles: number;
    totalQuestions: number;
    totalAnswered: number;
    totalFollowers: number;
};

export async function fetchAdminExperts(): Promise<AdminExpertItem[]> {
    const res = await apiGet<{ experts: AdminExpertItem[] }>('/admin/experts');
    return res.experts || [];
}

export async function createAdminExpert(data: CreateExpertData): Promise<AdminExpertItem> {
    const res = await apiPost<{ expert: AdminExpertItem }>('/admin/experts', data);
    return res.expert;
}

export async function demoteAdminExpert(expertId: number): Promise<void> {
    await apiDelete<{ message: string }>(`/admin/experts/${expertId}`);
}

// Permanently deletes the Expert account and all associated data. Irreversible.
export async function deleteAdminExpert(expertId: number): Promise<void> {
    await apiDelete<{ message: string }>(`/admin/experts/${expertId}/permanent`);
}

export async function fetchAdminReports(): Promise<AdminReports> {
    const res = await apiGet<{ reports: AdminReports }>('/admin/reports');
    return res.reports;
}
