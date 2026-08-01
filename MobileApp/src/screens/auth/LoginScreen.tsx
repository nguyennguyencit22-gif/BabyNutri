import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import type {
    AppDispatch,
} from '../../store/Store';

import {
    loginFailed,
    loginStarted,
    loginSucceeded,
} from '../../store/auth/authSlice';
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
    loginWithGoogle,
} from '../../services/firebaseAuthService';

import styles from '../../styles/auth/loginStyles';

function LoginScreen({ navigation }: any) {
    const [loading, setLoading] = useState(false);

    const dispatch =
        useDispatch<AppDispatch>();

    const handleClose = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };


    const handleGoogleLogin = async () => {
        if (loading) {
            return;
        }

        try {
            setLoading(true);
            dispatch(loginStarted());

            const {
                user,
                firebaseIdToken,
            } = await loginWithGoogle();

            dispatch(
                loginSucceeded({
                    firebaseIdToken,
                    user: {
                        uid: user.uid,
                        email: user.email ?? '',
                        displayName:
                            user.displayName ??
                            'BabyNutri User',
                        photoURL:
                            user.photoURL ??
                            undefined,

                        // Tạm thời dùng parent.
                        // Sau này role phải lấy từ backend.
                        role: 'parent',
                    },
                }),
            );

            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'Home',
                    },
                ],
            });
        } catch (error) {
            dispatch(loginFailed());

            console.log(
                'Google login error:',
                error,
            );

            Alert.alert(
                'Login Failed',
                error instanceof Error
                    ? error.message
                    : 'Unable to sign in with Google.',
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
                    disabled={loading}
                    onPress={handleGoogleLogin}
                    style={({ pressed }) => [
                        styles.googleButton,
                        pressed &&
                        !loading &&
                        styles.buttonPressed,
                        loading &&
                        styles.googleButtonDisabled,
                    ]}>
                    <Image
                        source={require('../../assets/images/google.png')}
                        style={styles.googleLogo}
                    />

                    <Text style={styles.googleButtonText}>
                        {loading
                            ? 'Signing in...'
                            : 'Continue with Google'}
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