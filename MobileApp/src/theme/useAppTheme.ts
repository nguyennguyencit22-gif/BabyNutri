import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import type {
    RootState,
} from '../store/Store';

import {
    darkColors,
    lightColors,
} from './colors';

import type {
    AppColors,
} from './colors';

export function useAppTheme() {
    const systemColorScheme = useColorScheme();

    const mode = useSelector(
        (state: RootState) =>
            state.theme.mode,
    );

    const isDark =
        mode === 'system'
            ? systemColorScheme === 'dark'
            : mode === 'dark';

    const colors: AppColors =
        isDark ? darkColors : lightColors;

    return {
        mode,
        isDark,
        colors,
    };
}
