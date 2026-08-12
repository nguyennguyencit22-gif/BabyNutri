import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import ProfileHeader from '../../components/profile/ProfileHeader';
import createStyles from '../../styles/settings/themeSettingsStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const CheckIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 6L9 17l-5-5" />
    </Svg>
);

import type { AppDispatch, RootState } from '../../store/store';
import { setThemeMode } from '../../store/settings/themeSlice';
import type { AppThemeMode } from '../../types/settings/theme';

type ThemeOption = {
    labelKey: string;
    value: AppThemeMode;
};

const THEME_OPTIONS: ThemeOption[] = [
    {
        labelKey: 'theme.system',
        value: 'system',
    },
    {
        labelKey: 'theme.light',
        value: 'light',
    },
    {
        labelKey: 'theme.dark',
        value: 'dark',
    },
];

function ThemeSettingsScreen({
    navigation,
}: any) {
    const { t } = useTranslation();
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
                title={t('theme.title')}
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
                                    <CheckIcon
                                        size={20}
                                        color={colors.onPrimary}
                                    />
                                ) : null}
                            </View>

                            <Text style={styles.optionText}>
                                {t(option.labelKey)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

export default ThemeSettingsScreen;
