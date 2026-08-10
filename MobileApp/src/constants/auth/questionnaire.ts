export const ALLERGIES = [
    'Milk',
    'Eggs',
    'Peanuts',
    'Seafood',
    'None',
];

export type Gender = 'Boy' | 'Girl';

export type ChildQuestionnaire = {
    hasChild: boolean | null;
    childName: string;
    ageGroup: string;
    gender: Gender | '';
    allergies: string[];
    nutritionGoal: string;
    foodPreferences: string[];
};