import { apiDelete, apiGet, apiPost, apiPut } from './api';

export type GrowthRecord = {
    id: number;
    childId: number;
    recordDate: string;
    weight: number;
    height: number;
    headCircumference?: number | null;
    bmi: number;
    status: string;
    notes?: string | null;
    ageMonths: number;
};

export type WHOStandardPoint = {
    month: number;
    p3: number;
    p50: number;
    p97: number;
};

export type WHOStandards = {
    weight: WHOStandardPoint[];
    height: WHOStandardPoint[];
    bmi: WHOStandardPoint[];
};

export type ChildGrowthSummary = {
    id: number;
    name: string;
    dateOfBirth: string | null;
    gender: string;
    currentWeight: number;
    currentHeight: number;
    currentBMI: number;
    currentAgeMonths: number;
    growthStatus: string;
};

export type GrowthDataResponse = {
    child: ChildGrowthSummary;
    whoStandards: WHOStandards;
    records: GrowthRecord[];
};

export type GrowthRecordInput = {
    recordDate: string;
    weight: number;
    height: number;
    headCircumference?: number | null;
    notes?: string | null;
};

export const fetchGrowthData = (childId: number): Promise<GrowthDataResponse> =>
    apiGet<GrowthDataResponse>(`/children/${childId}/growth`);

export const addGrowthRecord = (
    childId: number,
    input: GrowthRecordInput,
): Promise<GrowthRecord> =>
    apiPost<GrowthRecord>(`/children/${childId}/growth`, input);

export const updateGrowthRecord = (
    childId: number,
    recordId: number,
    input: GrowthRecordInput,
): Promise<GrowthRecord> =>
    apiPut<GrowthRecord>(`/children/${childId}/growth/${recordId}`, input);

export const deleteGrowthRecord = (
    childId: number,
    recordId: number,
): Promise<{ message: string }> =>
    apiDelete<{ message: string }>(`/children/${childId}/growth/${recordId}`);
