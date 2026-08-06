import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';

import {
    applyTranslatedBundle,
    BASE_LANGUAGE,
    baseResourceEntries,
    setActiveLanguage,
    unflattenResource,
} from '../../i18n';

import {
    getStoredBundle,
    getStoredLanguageCode,
    setStoredBundle,
    setStoredLanguageCode,
} from '../../i18n/languageStorage';

import { translateBatch } from '../../services/translationService';

type LanguageState = {
    code: string;
    status: 'idle' | 'loading' | 'ready' | 'error';
    error: string | null;
};

const initialState: LanguageState = {
    code: BASE_LANGUAGE,
    status: 'idle',
    error: null,
};

async function applyCachedBundle(code: string): Promise<boolean> {
    const cached = await getStoredBundle(code);

    if (!cached) {
        return false;
    }

    applyTranslatedBundle(
        code,
        unflattenResource(Object.entries(cached)),
    );
    await setActiveLanguage(code);
    return true;
}

// Selecting a language the user has never picked before triggers exactly
// one batch call to Google Translate (via the backend); every string on
// screen is translated in that single request, then cached on-device so
// switching back to this language later is instant and offline.
export const changeLanguage = createAsyncThunk(
    'language/changeLanguage',
    async (code: string) => {
        if (code === BASE_LANGUAGE) {
            await setActiveLanguage(code);
            await setStoredLanguageCode(code);
            return code;
        }

        const hitCache = await applyCachedBundle(code);

        if (!hitCache) {
            const keys = baseResourceEntries.map(([key]) => key);
            const values = baseResourceEntries.map(([, value]) => value);
            const translatedValues = await translateBatch(values, code);

            const entries: Record<string, string> = {};
            keys.forEach((key, index) => {
                entries[key] = translatedValues[index];
            });

            applyTranslatedBundle(code, unflattenResource(Object.entries(entries)));
            await setActiveLanguage(code);
            await setStoredBundle(code, entries);
        }

        await setStoredLanguageCode(code);
        return code;
    },
);

// Runs once at app boot to restore whatever language + cached bundle the
// user last picked, without calling the translate API again.
export const restoreLanguage = createAsyncThunk(
    'language/restoreLanguage',
    async () => {
        const storedCode = await getStoredLanguageCode();

        if (!storedCode || storedCode === BASE_LANGUAGE) {
            return BASE_LANGUAGE;
        }

        const hitCache = await applyCachedBundle(storedCode);
        return hitCache ? storedCode : BASE_LANGUAGE;
    },
);

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(changeLanguage.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(
                changeLanguage.fulfilled,
                (state, action: PayloadAction<string>) => {
                    state.code = action.payload;
                    state.status = 'ready';
                },
            )
            .addCase(changeLanguage.rejected, (state, action) => {
                state.status = 'error';
                state.error =
                    action.error.message ?? 'Failed to change language';
            })
            .addCase(
                restoreLanguage.fulfilled,
                (state, action: PayloadAction<string>) => {
                    state.code = action.payload;
                    state.status = 'ready';
                },
            );
    },
});

export default languageSlice.reducer;
