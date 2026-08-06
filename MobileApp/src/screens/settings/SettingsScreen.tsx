import React from 'react';
import {
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';

import createStyles from '../../styles/settings/settingsStyles';
import { useAppTheme } from '../../theme/useAppTheme';

function SettingsScreen({ navigation }: any) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProfileHeader
                title="Settings"
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

                <ProfileMenuItem
                    title="Themes"
                    showArrow
                    onPress={() => {
                        navigation.navigate(
                            'ThemeSettings',
                        );
                    }}
                />

                <ProfileMenuItem
                    title="Language"
                    showArrow
                    onPress={() => {
                        navigation.navigate(
                            'LanguageSettings',
                        );
                    }}
                />

                <ProfileMenuItem
                    title="Measurement units"
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