import { apiGet } from './api';

export type HomeRecipe = {
    id: number;
    title: string;
    time: string;
    image: string;
    rating: number;
    ratingCount: number;
    favoriteCount: number;
};

export type HomeExpert = {
    id: number;
    name: string;
    role: string;
    image: string;
};

export type HomeJourneyItem = {
    id: number;
    age: string;
    title: string;
    description: string;
    colorMonth: string;
    imageKey: string | null;
};

export type HomeData = {
    popularCategories: string[];
    popularRecipes: HomeRecipe[];
    experts: HomeExpert[];
    journeyItems: HomeJourneyItem[];
    weaningFeatures: string[];
};

export function fetchHomeData(): Promise<HomeData> {
    return apiGet<HomeData>('/home');
}
