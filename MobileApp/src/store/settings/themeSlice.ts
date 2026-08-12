import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
    AppThemeMode,
} from '../../types/settings/theme';

const STORAGE_KEY = '@babynutri_theme_mode';

type ThemeState = {
    mode: AppThemeMode;
};

const initialState: ThemeState = {
    mode: 'system',
};

export const restoreThemeMode = createAsyncThunk(
    'theme/restoreThemeMode',
    async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved === 'light' || saved === 'dark' || saved === 'system') {
                return saved as AppThemeMode;
            }
        } catch (e) {
            console.error('restoreThemeMode error:', e);
        }
        return 'system' as AppThemeMode;
    },
);

export const setThemeModeAsync = createAsyncThunk(
    'theme/setThemeModeAsync',
    async (mode: AppThemeMode) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, mode);
        } catch (e) {
            console.error('setThemeMode error:', e);
        }
        return mode;
    },
);

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setThemeMode: (
            state,
            action: PayloadAction<AppThemeMode>,
        ) => {
            state.mode = action.payload;
            AsyncStorage.setItem(STORAGE_KEY, action.payload).catch(() => {});
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(restoreThemeMode.fulfilled, (state, action) => {
                state.mode = action.payload;
            })
            .addCase(setThemeModeAsync.fulfilled, (state, action) => {
                state.mode = action.payload;
            });
    },
});

export const {
    setThemeMode,
} = themeSlice.actions;

export default themeSlice.reducer;