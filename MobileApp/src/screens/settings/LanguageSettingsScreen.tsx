import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const CheckIcon = ({ size = 14, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 6L9 17l-5-5" />
    </Svg>
);

import ProfileHeader from '../../components/profile/ProfileHeader';

import type { AppDispatch, RootState } from '../../store/Store';
import { changeLanguage } from '../../store/settings/languageSlice';

import {
    fetchSupportedLanguages,
    LanguageOption,
} from '../../services/translationService';

import createStyles from '../../styles/settings/languageSettingsStyles';
import { useAppTheme } from '../../theme/useAppTheme';

function LanguageSettingsScreen({ navigation }: any) {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const selectedCode = useSelector(
        (state: RootState) => state.language.code,
    );
    const status = useSelector(
        (state: RootState) => state.language.status,
    );

    const [languages, setLanguages] = React.useState<LanguageOption[]>([]);

    React.useEffect(() => {
        fetchSupportedLanguages()
            .then(setLanguages)
            .catch(() => setLanguages([]));
    }, []);

    const handleSelectLanguage = (code: string) => {
        if (code === selectedCode) {
            return;
        }

        dispatch(changeLanguage(code));
    };

    return (
        <SafeAreaView style={styles.safeArea}>

            <ProfileHeader
                title={t('language.title')}
                onBack={() => navigation.goBack()}
            />

            <FlatList
                data={languages}
                keyExtractor={(item) => item.code}
                contentContainerStyle={styles.content}
                renderItem={({ item }) => {
                    const isSelected = selectedCode === item.code;

                    return (
                        <Pressable
                            onPress={() => handleSelectLanguage(item.code)}
                            style={({ pressed }) => [
                                styles.optionRow,
                                pressed && styles.optionPressed,
                            ]}>

                            <View
                                style={[
                                    styles.radio,
                                    isSelected && styles.radioSelected,
                                ]}>
                                {isSelected ? (
                                    <CheckIcon
                                        size={14}
                                        color={colors.onPrimary}
                                    />
                                ) : null}
                            </View>

                            <Text style={styles.optionText}>
                                {item.nativeName} ({item.name})
                            </Text>
                        </Pressable>
                    );
                }}
            />

            {status === 'loading' ? (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator
                            size="large"
                            color={colors.primary}
                        />
                        <Text style={styles.loadingText}>
                            {t('common.loading')}
                        </Text>
                    </View>
                </View>
            ) : null}
        </SafeAreaView>
    );
}

export default LanguageSettingsScreen;
