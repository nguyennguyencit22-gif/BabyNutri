import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';

import {
    SafeAreaView,
} from 'react-native-safe-area-context';

import {
    Icon,
} from 'react-native-paper';

import {
    useDispatch,
    useSelector,
} from 'react-redux';

import ProfileHeader from '../../components/profile/ProfileHeader';

import type {
    AppDispatch,
    RootState,
} from '../../store/Store';

import {
    setThemeMode,
} from '../../store/settings/themeSlice';

import type {
    AppThemeMode,
} from '../../types/settings/theme';

import createStyles from '../../styles/settings/themeSettingsStyles';
import { useAppTheme } from '../../theme/useAppTheme';

type ThemeOption = {
    label: string;
    value: AppThemeMode;
};

const THEME_OPTIONS: ThemeOption[] = [
    {
        label: 'System default',
        value: 'system',
    },
    {
        label: 'Light',
        value: 'light',
    },
    {
        label: 'Dark',
        value: 'dark',
    },
];

function ThemeSettingsScreen({
    navigation,
}: any) {
    const dispatch =
        useDispatch<AppDispatch>();

    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const selectedMode = useSelector(
        (state: RootState) =>
            state.theme.mode,
    );

    const handleSelectTheme = (
        mode: AppThemeMode,
    ) => {
        dispatch(setThemeMode(mode));
    };

    return (
        <SafeAreaView style={styles.safeArea}>

            <ProfileHeader
                title="Theme"
                onBack={() =>
                    navigation.goBack()
                }
            />

            <View style={styles.content}>
                {THEME_OPTIONS.map(option => {
                    const isSelected =
                        selectedMode ===
                        option.value;

                    return (
                        <Pressable
                            key={option.value}
                            onPress={() =>
                                handleSelectTheme(
                                    option.value,
                                )
                            }
                            style={({ pressed }) => [
                                styles.optionRow,
                                pressed &&
                                styles.optionPressed,
                            ]}>

                            <View
                                style={[
                                    styles.radio,
                                    isSelected &&
                                    styles.radioSelected,
                                ]}>
                                {isSelected ? (
                                    <Icon
                                        source="check"
                                        size={20}
                                        color={colors.onPrimary}
                                    />
                                ) : null}
                            </View>

                            <Text style={styles.optionText}>
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

export default ThemeSettingsScreen;
