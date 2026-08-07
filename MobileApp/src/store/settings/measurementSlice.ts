import {
    createAsyncThunk,
    createSlice,
} from '@reduxjs/toolkit';

import {
    fetchMeasurementSettings,
    saveMeasurementSettings,
    MeasurementSettings,
} from '../../services/measurement.service';

type MeasurementState = MeasurementSettings & {
    status: 'idle' | 'loading' | 'ready' | 'saving' | 'error';
    error: string | null;
};

const initialState: MeasurementState = {
    useMetric: true,
    weightUnit: 'kg',
    volumeUnit: 'ml',
    lengthUnit: 'cm',
    temperatureUnit: 'C',
    status: 'idle',
    error: null,
};

// Runs once when the Measurement units screen mounts — reads whatever this
// user last saved on the backend (or the metric defaults if they never have).
export const loadMeasurementSettings = createAsyncThunk(
    'measurement/load',
    () => fetchMeasurementSettings(),
);

// Persists to MySQL via PUT /api/measurement-settings so the setting follows
// the user across devices instead of living only in AsyncStorage/Redux.
export const updateMeasurementSettings = createAsyncThunk(
    'measurement/update',
    (settings: MeasurementSettings) => saveMeasurementSettings(settings),
);

const measurementSlice = createSlice({
    name: 'measurement',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadMeasurementSettings.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loadMeasurementSettings.fulfilled, (state, action) => {
                Object.assign(state, action.payload);
                state.status = 'ready';
            })
            .addCase(loadMeasurementSettings.rejected, (state, action) => {
                state.status = 'error';
                state.error =
                    action.error.message ?? 'Failed to load measurement settings';
            })
            .addCase(updateMeasurementSettings.pending, (state, action) => {
                // Optimistic update so the radio button reacts instantly.
                Object.assign(state, action.meta.arg);
                state.status = 'saving';
            })
            .addCase(updateMeasurementSettings.fulfilled, (state, action) => {
                Object.assign(state, action.payload);
                state.status = 'ready';
            })
            .addCase(updateMeasurementSettings.rejected, (state, action) => {
                state.status = 'error';
                state.error =
                    action.error.message ?? 'Failed to save measurement settings';
            });
    },
});

export default measurementSlice.reducer;
