import React from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { useAppTheme } from '../../theme/useAppTheme';

function AboutScreen({ navigation }: any) {
    const { colors } = useAppTheme();

    const openPrivacyPolicy = () => {
        // TODO: Navigate to Privacy Policy screen
    };

    const openTermsOfService = () => {
        // TODO: Navigate to Terms of Service screen
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <ProfileHeader
                title="About"
                onBack={() => navigation.goBack()}
            />
            <View style={styles.content}>
                <Image
                    source={require('../../assets/images/babynutri-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={[styles.appName, { color: colors.text }]}>
                    BabyNutri
                </Text>

                <View style={styles.infoSection}>
                    <Text style={[styles.teamName, { color: colors.textSoft }]}>
                        Whisper Arts
                    </Text>

                    <Pressable onPress={openPrivacyPolicy}>
                        <Text style={[styles.link, { color: colors.primary }]}>
                            Privacy Policy
                        </Text>
                    </Pressable>

                    <Pressable onPress={openTermsOfService}>
                        <Text style={[styles.link, { color: colors.primary }]}>
                            Terms of Service
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default AboutScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 28,
    },
    logo: {
        width: 92,
        height: 92,
        marginTop: 10,
    },
    appName: {
        marginTop: 12,
        fontSize: 31,
        fontWeight: '700',
    },
    infoSection: {
        marginTop: 78,
        alignItems: 'center',
        gap: 18,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '500',
    },
    link: {
        fontSize: 16,
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
});