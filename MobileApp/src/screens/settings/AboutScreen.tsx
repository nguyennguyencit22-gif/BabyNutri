import ProfileHeader from '@/components/profile/ProfileHeader';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function AboutScreen({ navigation }: any) {
    const openPrivacyPolicy = () => {
        // TODO: Navigate to Privacy Policy screen
    };

    const openTermsOfService = () => {
        // TODO: Navigate to Terms of Service screen
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProfileHeader
                title="About"
                onBack={() =>
                    navigation.goBack()
                } />
            <View style={styles.content}>

                <Image
                    source={require(
                        '../../assets/images/babynutri-logo.png'
                    )}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.appName}>
                    BabyNutri
                </Text>

                <View style={styles.infoSection}>

                    <Text style={styles.teamName}>
                        Whisper Arts
                    </Text>

                    <Pressable
                        onPress={
                            openPrivacyPolicy
                        }>
                        <Text style={styles.link}>
                            Privacy Policy
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={
                            openTermsOfService
                        }>
                        <Text style={styles.link}>
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
        backgroundColor: '#FFFDF9',
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
        color: '#5B0010',
        fontSize: 31,
        fontWeight: '500',
    },

    infoSection: {
        marginTop: 78,
        alignItems: 'center',
        gap: 18,
    },

    teamName: {
        color: '#5B0010',
        fontSize: 16,
    },

    link: {
        color: '#5B0010',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});