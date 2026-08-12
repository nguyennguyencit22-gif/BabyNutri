import { configureStore } from '@reduxjs/toolkit';

import authReducer from './auth/authSlice';
import babyReducer from './babySlice';
import historyReducer from './historySlice';
import themeReducer from './settings/themeSlice';
import languageReducer from './settings/languageSlice';
import measurementReducer from './settings/measurementSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        baby: babyReducer,
        history: historyReducer,
        theme: themeReducer,
        language: languageReducer,
        measurement: measurementReducer,
    },
});

export type RootState =
    ReturnType<typeof store.getState>;

export type AppDispatch =
    typeof store.dispatch;