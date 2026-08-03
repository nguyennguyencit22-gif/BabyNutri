import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';

import type {
    AppThemeMode,
} from '../../types/settings/theme';

type ThemeState = {
    mode: AppThemeMode;
};

const initialState: ThemeState = {
    mode: 'system',
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setThemeMode: (
            state,
            action: PayloadAction<AppThemeMode>,
        ) => {
            state.mode = action.payload;
        },
    },
});

export const {
    setThemeMode,
} = themeSlice.actions;

export default themeSlice.reducer;