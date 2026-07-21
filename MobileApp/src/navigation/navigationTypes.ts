import type {
    ChildQuestionnaire,
} from '../types/auth/questionnaire';

export type RootStackParamList = {
    Welcome: undefined;

    FeatureIntro: {
        userMode: 'guest' | 'authenticated';
        firebaseIdToken?: string;
    };

    Login: undefined;
    Register: undefined;

    Questionnaire: {
        userMode: 'guest' | 'authenticated';
        firebaseIdToken?: string;
    };

    Home:
    | {
        userMode: 'guest' | 'authenticated';
        questionnaire?: ChildQuestionnaire;
    }
    | undefined;
};