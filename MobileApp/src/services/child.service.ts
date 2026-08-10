import { apiDelete, apiGet, apiPost, apiPut } from './api';

export type BackendChildGender = 'boy' | 'girl';
export type BackendWeightUnit = 'kg' | 'lb';
export type BackendHeightUnit = 'cm' | 'in';

export type CaregiverPermission = 'owner' | 'editor';

export type BackendChildProfile = {
    id: number;
    name: string;
    dateOfBirth: string | null;
    gender: string | null;
    weight: number | null;
    weightUnit: BackendWeightUnit;
    height: number | null;
    heightUnit: BackendHeightUnit;
    imageUrl: string | null;
    profileColor: string | null;
    nutritionGoal: string | null;
    profileCode: string | null;
    permission: CaregiverPermission;
    allergies: string[];
    foodPreferences: string[];
};

export type ChildProfilePayload = {
    name: string;
    dateOfBirth: string | null;
    gender: BackendChildGender;
    weight?: number;
    weightUnit?: BackendWeightUnit;
    height?: number;
    heightUnit?: BackendHeightUnit;
    imageUrl?: string | null;
    profileColor?: string | null;
    nutritionGoal?: string | null;
    allergies: string[];
    foodPreferences: string[];
};

export const fetchChildren = (): Promise<BackendChildProfile[]> =>
    apiGet<BackendChildProfile[]>('/children');

export const createChild = (
    payload: ChildProfilePayload,
): Promise<BackendChildProfile> =>
    apiPost<BackendChildProfile>('/children', payload);

export const updateChild = (
    id: number,
    payload: ChildProfilePayload,
): Promise<BackendChildProfile> =>
    apiPut<BackendChildProfile>(`/children/${id}`, payload);

export const deleteChild = (id: number): Promise<{ message: string }> =>
    apiDelete<{ message: string }>(`/children/${id}`);

// Idempotent: returns the same still-active code on repeated calls instead
// of minting a new one every time the "Copy baby's code" menu item opens.
export const getOrCreateInvitationCode = (
    childId: number,
): Promise<{ code: string }> =>
    apiPost<{ code: string }>(`/children/${childId}/invitations`);

export const activateInvitationCode = (
    code: string,
): Promise<{ message: string; childId: number }> =>
    apiPost<{ message: string; childId: number }>('/invitations/activate', {
        code,
    });
