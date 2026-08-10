import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';

import type {
    BabyProfile,
} from '../types/profile/babyProfile';

import type {
    RootState,
} from './Store';

import {
    createChild,
    deleteChild as deleteChildApi,
    fetchChildren,
    updateChild as updateChildApi,
    BackendChildProfile,
    ChildProfilePayload,
} from '../services/child.service';

import { PROFILE_COLORS } from '../constants/profile/babyProfileData';

type BabyState = {
    babies: BabyProfile[];
    selectedBabyId: string | null;
};

const initialState: BabyState = {
    babies: [],
    selectedBabyId: null,
};

// The `child_profiles.gender` column already holds legacy values like
// 'Female'/'Male' from earlier seed data, alongside the app's own
// 'boy'/'girl' — normalize whatever comes back from the API.
function normalizeGender(value: string | null): 'boy' | 'girl' {
    const lower = (value ?? '').toLowerCase();
    return lower === 'girl' || lower === 'female' ? 'girl' : 'boy';
}

function toBackendPayload(baby: BabyProfile): ChildProfilePayload {
    return {
        name: baby.name,
        dateOfBirth: baby.dateOfBirth || null,
        gender: baby.gender,
        weight: baby.weight,
        weightUnit: baby.weightUnit,
        height: baby.height,
        heightUnit: baby.heightUnit,
        profileColor: baby.profileColor,
        nutritionGoal: baby.nutritionGoal,
        allergies: baby.allergies,
        foodPreferences: baby.foodPreferences ?? [],
    };
}

function fromBackendChild(child: BackendChildProfile): BabyProfile {
    return {
        id: String(child.id),
        name: child.name,
        profileColor: child.profileColor ?? PROFILE_COLORS[0],
        gender: normalizeGender(child.gender),
        dateOfBirth: child.dateOfBirth ?? '',
        allergies: child.allergies,
        nutritionGoal: child.nutritionGoal ?? undefined,
        foodPreferences: child.foodPreferences,
        weight: child.weight ?? undefined,
        weightUnit: child.weightUnit,
        height: child.height ?? undefined,
        heightUnit: child.heightUnit,
        profileCode: child.profileCode ?? undefined,
        permission: child.permission,
    };
}

const babySlice = createSlice({
    name: 'baby',

    initialState,

    reducers: {
        // Low-level, synchronous — only ever touch Redux. Used directly for
        // guest mode, and internally by the thunks below once the backend
        // call (for a real account) has succeeded.
        addBaby: (
            state,
            action: PayloadAction<BabyProfile>,
        ) => {
            state.babies.push(action.payload);

            // Nếu đây là baby đầu tiên,
            // tự động chọn baby đó.
            if (!state.selectedBabyId) {
                state.selectedBabyId =
                    action.payload.id;
            }
        },

        updateBaby: (
            state,
            action: PayloadAction<BabyProfile>,
        ) => {
            const babyIndex =
                state.babies.findIndex(
                    baby =>
                        baby.id ===
                        action.payload.id,
                );

            if (babyIndex !== -1) {
                state.babies[babyIndex] =
                    action.payload;
            }
        },

        deleteBaby: (
            state,
            action: PayloadAction<string>,
        ) => {
            const deletedBabyId =
                action.payload;

            state.babies =
                state.babies.filter(
                    baby =>
                        baby.id !==
                        deletedBabyId,
                );

            // Nếu baby đang được chọn bị xóa,
            // chọn baby đầu tiên còn lại.
            if (
                state.selectedBabyId ===
                deletedBabyId
            ) {
                state.selectedBabyId =
                    state.babies.length > 0
                        ? state.babies[0].id
                        : null;
            }
        },

        // Replaces the whole list — used to hydrate Redux from MySQL right
        // after a real login (see loadBabies below).
        setBabies: (
            state,
            action: PayloadAction<BabyProfile[]>,
        ) => {
            state.babies = action.payload;

            const stillExists = state.babies.some(
                baby => baby.id === state.selectedBabyId,
            );

            if (!stillExists) {
                state.selectedBabyId =
                    state.babies.length > 0
                        ? state.babies[0].id
                        : null;
            }
        },

        selectBaby: (
            state,
            action: PayloadAction<string>,
        ) => {
            const babyExists =
                state.babies.some(
                    baby =>
                        baby.id ===
                        action.payload,
                );

            if (babyExists) {
                state.selectedBabyId =
                    action.payload;
            }
        },

        clearBabies: state => {
            state.babies = [];
            state.selectedBabyId = null;
        },
    },
});

export const {
    addBaby,
    updateBaby,
    deleteBaby,
    setBabies,
    selectBaby,
    clearBabies,
} = babySlice.actions;

// ==========================================
// Thunks — the ONE place that decides guest vs
// authenticated. Screens call these, never the
// raw reducers above, when saving user input.
// ==========================================

// Call once right after a real login succeeds, to replace whatever guest
// data was in Redux with this parent's actual rows from MySQL.
export const loadBabies = createAsyncThunk<
    void, void, { state: RootState }
>('baby/loadBabies', async (_arg, { getState, dispatch }) => {
    if (getState().auth.mode !== 'authenticated') {
        return;
    }

    const children = await fetchChildren();
    dispatch(setBabies(children.map(fromBackendChild)));
});

export const saveBaby = createAsyncThunk<
    void, BabyProfile, { state: RootState }
>('baby/saveBaby', async (baby, { getState, dispatch }) => {
    if (getState().auth.mode !== 'authenticated') {
        dispatch(addBaby(baby));
        return;
    }

    const created = await createChild(toBackendPayload(baby));
    dispatch(addBaby(fromBackendChild(created)));
});

export const editBaby = createAsyncThunk<
    void, BabyProfile, { state: RootState }
>('baby/editBaby', async (baby, { getState, dispatch }) => {
    if (getState().auth.mode !== 'authenticated') {
        dispatch(updateBaby(baby));
        return;
    }

    const updated = await updateChildApi(
        Number(baby.id),
        toBackendPayload(baby),
    );
    dispatch(updateBaby(fromBackendChild(updated)));
});

export const removeBaby = createAsyncThunk<
    void, string, { state: RootState }
>('baby/removeBaby', async (babyId, { getState, dispatch }) => {
    if (getState().auth.mode === 'authenticated') {
        await deleteChildApi(Number(babyId));
    }

    dispatch(deleteBaby(babyId));
});

export default babySlice.reducer;
