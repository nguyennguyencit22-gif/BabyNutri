import { configureStore } from '@reduxjs/toolkit';

import authReducer from './auth/authSlice';
import babyReducer from './babySlice';
import themeReducer from './settings/themeSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        baby: babyReducer,
        theme: themeReducer,
    },
});

export type RootState =
    ReturnType<typeof store.getState>;

export type AppDispatch =
    typeof store.dispatch;