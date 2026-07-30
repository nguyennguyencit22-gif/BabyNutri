import { configureStore } from '@reduxjs/toolkit';

import babyReducer from './babySlice';

export const store = configureStore({
    reducer: {
        baby: babyReducer,
    },
});

export type RootState = ReturnType<
    typeof store.getState
>;

export type AppDispatch =
    typeof store.dispatch;