import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_STORAGE_KEY = '@app_history_activities_v1';

export interface ActivityItem {
    id: string;
    type: 'like' | 'comment' | 'create' | 'delete' | 'save' | 'action';
    title: string;
    details?: string;
    timestamp: string;
    icon?: string;
}

interface HistoryState {
    activities: ActivityItem[];
    isLoaded: boolean;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
    {
        id: 'init-1',
        type: 'create',
        title: 'Created baby profile for Minh An',
        details: 'Gender: Boy · Added to active profiles',
        timestamp: new Date().toISOString(),
        icon: '👶',
    },
    {
        id: 'init-2',
        type: 'like',
        title: 'Liked recipe: Pumpkin & Pork Porridge',
        details: 'Saved to favorite weaning recipes',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        icon: '❤️',
    },
    {
        id: 'init-3',
        type: 'comment',
        title: 'Commented on article: Weaning Guide for 6 Months',
        details: '"Very helpful guide for new mothers!"',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        icon: '💬',
    },
];

const initialState: HistoryState = {
    activities: DEFAULT_ACTIVITIES,
    isLoaded: false,
};

export const loadPersistedHistory = createAsyncThunk(
    'history/loadPersistedHistory',
    async () => {
        try {
            const json = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
            if (json != null) {
                const parsed = JSON.parse(json);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed as ActivityItem[];
                }
            }
        } catch (e) {
            console.error('Failed to load history from AsyncStorage:', e);
        }
        return DEFAULT_ACTIVITIES;
    }
);

const saveHistoryToStorage = async (activities: ActivityItem[]) => {
    try {
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(activities));
    } catch (e) {
        console.error('Failed to save history to AsyncStorage:', e);
    }
};

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        addActivity: (state, action: PayloadAction<{ type: ActivityItem['type']; title: string; details?: string; icon?: string }>) => {
            const newItem: ActivityItem = {
                ...action.payload,
                id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                timestamp: new Date().toISOString(),
            };
            state.activities.unshift(newItem);
            saveHistoryToStorage(state.activities);
        },
        clearHistory: (state) => {
            state.activities = [];
            saveHistoryToStorage([]);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadPersistedHistory.fulfilled, (state, action) => {
            state.activities = action.payload;
            state.isLoaded = true;
        });
    },
});

export const { addActivity, clearHistory } = historySlice.actions;
export default historySlice.reducer;
