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
    dateOfBirth: string;
    gender: Gender | '';

    weight: number;
    weightUnit: 'kg' | 'lb';

    height: number;
    heightUnit: 'cm' | 'in';

    allergies: string[];
    nutritionGoal: string;
    foodPreferences: string[];
};