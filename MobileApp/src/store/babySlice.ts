import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';

import type {
    BabyProfile,
} from '../types/profile/babyProfile';

type BabyState = {
    babies: BabyProfile[];
    selectedBabyId: string | null;
};

const initialState: BabyState = {
    babies: [],
    selectedBabyId: null,
};

const babySlice = createSlice({
    name: 'baby',

    initialState,

    reducers: {
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
    selectBaby,
    clearBabies,
} = babySlice.actions;

export default babySlice.reducer;