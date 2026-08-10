export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    Home: undefined;
    Profile: undefined;
    ChildList: undefined;
    ChildDetail: { childId: string };
    AddEditChild: { childId?: string };
    MealPlanList: undefined;
    MealPlanDetail: { date: string; dayName: string; dateStr: string };
    FAQ: undefined;
};