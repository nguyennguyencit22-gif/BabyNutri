import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';

export type UserRole =
    | 'parent'
    | 'expert'
    | 'admin';

export type SessionMode =
    | 'guest'
    | 'authenticated';

export type AuthUser = {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
};

type AuthState = {
    mode: SessionMode;
    user: AuthUser | null;
    firebaseIdToken: string | null;
    loading: boolean;
};

const initialState: AuthState = {
    mode: 'guest',
    user: null,
    firebaseIdToken: null,
    loading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        continueAsGuest: state => {
            state.mode = 'guest';
            state.user = null;
            state.firebaseIdToken = null;
        },

        loginStarted: state => {
            state.loading = true;
        },

        loginSucceeded: (
            state,
            action: PayloadAction<{
                user: AuthUser;
                firebaseIdToken: string;
            }>,
        ) => {
            state.mode = 'authenticated';
            state.user = action.payload.user;
            state.firebaseIdToken =
                action.payload.firebaseIdToken;
            state.loading = false;
        },

        loginFailed: state => {
            state.loading = false;
        },

        logoutSucceeded: state => {
            state.mode = 'guest';
            state.user = null;
            state.firebaseIdToken = null;
            state.loading = false;
        },
    },
});

export const {
    continueAsGuest,
    loginStarted,
    loginSucceeded,
    loginFailed,
    logoutSucceeded,
} = authSlice.actions;

export default authSlice.reducer;