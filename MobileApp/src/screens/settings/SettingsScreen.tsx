import React from 'react';
import {
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';

import createStyles from '../../styles/settings/settingsStyles';
import { useAppTheme } from '../../theme/useAppTheme';

function SettingsScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProfileHeader
                title={t('settings.title')}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

                <ProfileMenuItem
                    title={t('settings.themes')}
                    showArrow
                    onPress={() => {
                        navigation.navigate(
                            'ThemeSettings',
                        );
                    }}
                />

                <ProfileMenuItem
                    title={t('settings.language')}
                    showArrow
                    onPress={() => {
                        navigation.navigate(
                            'LanguageSettings',
                        );
                    }}
                />

                <ProfileMenuItem
                    title={t('settings.measurementUnits')}
                    showArrow
                    onPress={() => {
                        navigation.navigate(
                            'MeasurementSettings',
                        );
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

export default SettingsScreen;