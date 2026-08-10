import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
    BabyProfile,
} from '../types/profile/babyProfile';

import type {
    RootState,
} from './store';

import {
    createChild,
    deleteChild as deleteChildApi,
    fetchChildren,
    updateChild as updateChildApi,
    BackendChildProfile,
    ChildProfilePayload,
} from '../services/child.service';

import { PROFILE_COLORS } from '../constants/profile/babyProfileData';

const BABY_STORAGE_KEY = '@baby_profiles_storage_v1';

type BabyState = {
    babies: BabyProfile[];
    selectedBabyId: string | null;
    isLoaded: boolean;
};

const DEFAULT_BABY: BabyProfile = {
    id: 'baby-default-1',
    name: 'Minh An',
    dateOfBirth: '2025-12-01T00:00:00.000Z',
    gender: 'boy',
    profileColor: '#FF7A59',
    allergies: [],
    nutritionGoal: 'Weight Gain',
    foodPreferences: ['Porridge', 'Fruit Smoothies'],
};

const initialState: BabyState = {
    babies: [DEFAULT_BABY],
    selectedBabyId: 'baby-default-1',
    isLoaded: false,
};

// AsyncThunk to load persisted baby profiles from AsyncStorage on app startup
export const loadPersistedBabies = createAsyncThunk(
    'baby/loadPersistedBabies',
    async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(BABY_STORAGE_KEY);
            if (jsonValue != null) {
                const parsed = JSON.parse(jsonValue);
                if (Array.isArray(parsed.babies) && parsed.babies.length > 0) {
                    return {
                        babies: parsed.babies as BabyProfile[],
                        selectedBabyId: (parsed.selectedBabyId || parsed.babies[0].id) as string,
                    };
                }
            }
        } catch (e) {
            console.error('Error loading persisted baby profiles:', e);
        }
        return {
            babies: [DEFAULT_BABY],
            selectedBabyId: 'baby-default-1',
        };
    }
);

// Helper function to persist state
const saveToStorage = async (babies: BabyProfile[], selectedBabyId: string | null) => {
    try {
        await AsyncStorage.setItem(
            BABY_STORAGE_KEY,
            JSON.stringify({ babies, selectedBabyId })
        );
    } catch (e) {
        console.error('Error saving baby profiles to AsyncStorage:', e);
    }
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

            if (!state.selectedBabyId) {
                state.selectedBabyId = action.payload.id;
            }
            saveToStorage(state.babies, state.selectedBabyId);
        },

        updateBaby: (
            state,
            action: PayloadAction<BabyProfile>,
        ) => {
            const babyIndex = state.babies.findIndex(
                baby => baby.id === action.payload.id,
            );

            if (babyIndex !== -1) {
                state.babies[babyIndex] = action.payload;
            }
            saveToStorage(state.babies, state.selectedBabyId);
        },

        deleteBaby: (
            state,
            action: PayloadAction<string>,
        ) => {
            const deletedBabyId = action.payload;

            state.babies = state.babies.filter(
                baby => baby.id !== deletedBabyId,
            );

            if (state.selectedBabyId === deletedBabyId) {
                state.selectedBabyId =
                    state.babies.length > 0
                        ? state.babies[0].id
                        : null;
            }
            saveToStorage(state.babies, state.selectedBabyId);
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
            const babyExists = state.babies.some(
                baby => baby.id === action.payload,
            );

            if (babyExists) {
                state.selectedBabyId = action.payload;
            }
            saveToStorage(state.babies, state.selectedBabyId);
        },

        clearBabies: state => {
            state.babies = [];
            state.selectedBabyId = null;
            saveToStorage([], null);
        },
    },

    extraReducers: (builder) => {
        builder.addCase(loadPersistedBabies.fulfilled, (state, action) => {
            state.babies = action.payload.babies;
            state.selectedBabyId = action.payload.selectedBabyId;
            state.isLoaded = true;
        });
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

import { addActivity } from './historySlice';

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
    } else {
        const created = await createChild(toBackendPayload(baby));
        dispatch(addBaby(fromBackendChild(created)));
    }

    dispatch(addActivity({
        type: 'create',
        title: `Created baby profile for ${baby.name}`,
        details: `Gender: ${baby.gender} · Added to profiles`,
        icon: '👶',
    }));
});

export const editBaby = createAsyncThunk<
    void, BabyProfile, { state: RootState }
>('baby/editBaby', async (baby, { getState, dispatch }) => {
    if (getState().auth.mode !== 'authenticated') {
        dispatch(updateBaby(baby));
    } else {
        const updated = await updateChildApi(
            Number(baby.id),
            toBackendPayload(baby),
        );
        dispatch(updateBaby(fromBackendChild(updated)));
    }

    dispatch(addActivity({
        type: 'action',
        title: `Updated baby profile for ${baby.name}`,
        details: 'Saved latest profile updates',
        icon: '✏️',
    }));
});

export const removeBaby = createAsyncThunk<
    void, string, { state: RootState }
>('baby/removeBaby', async (babyId, { getState, dispatch }) => {
    const existingBaby = getState().baby.babies.find(b => String(b.id) === String(babyId));

    if (getState().auth.mode === 'authenticated') {
        await deleteChildApi(Number(babyId));
    }

    dispatch(deleteBaby(babyId));

    if (existingBaby) {
        dispatch(addActivity({
            type: 'delete',
            title: `Deleted baby profile for ${existingBaby.name}`,
            details: 'Profile removed',
            icon: '🗑️',
        }));
    }
});

export default babySlice.reducer;
