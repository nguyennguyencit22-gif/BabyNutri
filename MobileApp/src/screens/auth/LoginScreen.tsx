import React, { useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    Pressable,

    ScrollView,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";

import {
    getGoogleLoginError,
    loginWithGoogle,
} from '../../services/firebaseAuthService';

import styles from '../../styles/auth/loginStyles';

function LoginScreen({ navigation }: any) {
    const handleClose = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const [loading, setLoading] = useState(false);
    const handleGoogleLogin = async () => {
        if (loading) {
            return;
        }

        try {
            setLoading(true);

            const { user, firebaseIdToken } =
                await loginWithGoogle();

            console.log('Firebase UID:', user.uid);
            console.log('Firebase email:', user.email);

            // Chỉ kiểm tra tạm thời, không log nguyên token khi production.
            console.log(
                'Firebase token received:',
                Boolean(firebaseIdToken),
            );

            Alert.alert(
                'Login successful',
                `Welcome ${user.displayName ?? user.email ?? 'User'}`,
            );

            // Tạm thời chuyển vào Home.
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            console.log('Google login error:', error);

            Alert.alert(
                'Login Failed',
                getGoogleLoginError(error),
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEditCountry = () => {
        Alert.alert(
            'Country',
            'Country selection will be added later.',
        );
    };

    const openTerms = async () => {
        await Linking.openURL('https://example.com/terms');
    };

    const openPrivacy = async () => {
        await Linking.openURL('https://example.com/privacy');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>

                <Pressable
                    onPress={handleClose}
                    hitSlop={12}
                    style={styles.closeButton}>
                    <Text style={styles.closeIcon}>×</Text>
                </Pressable>

                <View style={styles.header}>
                    <Text style={styles.title}>Login</Text>

                    <Text style={styles.subtitle}>
                        Log in to your account or register
                    </Text>
                </View>

                <Text style={styles.description}>
                    Our app is completely anonymous in use. It does not require
                    registration under your real name. All your data in the app will
                    not and cannot be used to recognize your identity.
                </Text>

                <View style={styles.countryRow}>
                    <View style={styles.countryInfo}>
                        <View style={styles.flagCircle}>
                            <Text style={styles.flagText}>★</Text>
                        </View>

                        <Text style={styles.countryName}>Vietnam</Text>
                    </View>

                    <Pressable onPress={handleEditCountry} hitSlop={10}>
                        <Text style={styles.editText}>Edit</Text>
                    </Pressable>
                </View>

                <Pressable
                    onPress={handleGoogleLogin}
                    style={({ pressed }) => [
                        styles.googleButton,
                        pressed && styles.buttonPressed,
                    ]}>
                    <Image
                        source={require('../../assets/images/google.png')}
                        style={styles.googleLogo}
                    />

                    <Text style={styles.googleButtonText}>
                        Continue with Google
                    </Text>
                </Pressable>

                {/* TEMPORARY BYPASS BUTTON FOR DEV */}
                <Pressable
                    onPress={() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                        });
                    }}
                    style={({ pressed }) => [
                        styles.googleButton,
                        { marginTop: 15, backgroundColor: '#f0f0f0' },
                        pressed && styles.buttonPressed,
                    ]}>
                    <Text style={[styles.googleButtonText, { color: 'red' }]}>
                        [DEV] Skip Login
                    </Text>
                </Pressable>

                <View style={styles.agreement}>
                    <Text style={styles.agreementText}>
                        By signing, you agree to our:
                    </Text>

                    <Pressable
                        onPress={openTerms}
                        style={styles.linkContainer}>
                        <Text style={styles.linkText}>
                            Terms of Service
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={openPrivacy}
                        style={styles.linkContainer}>
                        <Text style={styles.linkText}>
                            Service Privacy Policy
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default LoginScreen;