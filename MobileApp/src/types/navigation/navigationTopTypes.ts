import type {
    ChildQuestionnaire,
} from '../auth/questionnaire';

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

    AddBabyProfile: undefined;

    InvitationCode: undefined;

    EditBabyProfile: {
        babyId: string;
    };

    AccountSettings: undefined;

    Settings: undefined;

    ThemeSettings: undefined;

    LanguageSettings: undefined;

    MeasurementSettings: undefined;
    
};

