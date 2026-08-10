export type BabyGender = 'boy' | 'girl';

export type BabyProfileForm = {
    name: string;
    profileColor: string;
    gender: BabyGender;
    dateOfBirth: Date;
    allergies: string[];
    imageUri?: string | null;
};

export type BabyProfile = {
    id: string;
    name: string;
    profileColor: string;
    gender: 'boy' | 'girl';
    dateOfBirth: string;
    allergies: string[];
    nutritionGoal?: string;
    foodPreferences?: string[];

    weight?: number;
    weightUnit?: 'kg' | 'lb';
    height?: number;
    heightUnit?: 'cm' | 'in';
};