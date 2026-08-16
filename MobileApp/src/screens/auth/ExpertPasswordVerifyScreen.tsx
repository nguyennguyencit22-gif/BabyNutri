import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AppDispatch } from '../../store/store';
import { loginFailed, loginStarted, loginSucceeded } from '../../store/auth/authSlice';
import { verifyExpertTempPassword } from '../../services/auth.service';
import { loadBabies } from '../../store/babySlice';
import Icon from '../../components/common/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';

// Second step of a first-time Expert login. An Admin-created Expert
// account has no firebase_uid yet, so firebase-login stops short of
// issuing a session and sends the user here instead -- proving they
// also know the one-time password the Admin handed them confirms this
// is genuinely the person who was invited, not just whoever controls
// that inbox.
function ExpertPasswordVerifyScreen({ navigation, route }: any) {
    const { colors } = useAppTheme();
    const dispatch = useDispatch<AppDispatch>();

    const { firebaseIdToken, email, userUid, photoURL } = route.params || {};

    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async () => {
        if (!password.trim()) {
            setError('Please enter the temporary password.');
            return;
        }

        setError(null);
        setSubmitting(true);
        dispatch(loginStarted());

        try {
            const { user: backendUser } = await verifyExpertTempPassword(firebaseIdToken, password.trim());

            dispatch(
                loginSucceeded({
                    firebaseIdToken,
                    user: {
                        uid: userUid,
                        id: backendUser.id,
                        email: backendUser.email,
                        displayName: backendUser.fullName || 'BabyNutri Expert',
                        photoURL: backendUser.avatar ?? photoURL,
                        role: backendUser.role.toLowerCase() as 'parent' | 'expert' | 'admin',
                    },
                }),
            );

            try {
                await dispatch(loadBabies());
            } catch (e) {
                console.log('loadBabies error ignored:', e);
            }

            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        } catch (err) {
            dispatch(loginFailed());
            setError(err instanceof Error ? err.message : 'Incorrect temporary password.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancel sign-in?',
            'You can finish setting up your Expert account later.',
            [
                { text: 'Stay', style: 'cancel' },
                { text: 'Cancel', style: 'destructive', onPress: () => navigation.goBack() },
            ],
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Icon source="lock-outline" size={28} color="#FF5F70" />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Confirm your Expert account</Text>
                        <Text style={[styles.subtitle, { color: colors.textSoft }]}>
                            {email ? `${email} was set up by an Admin. ` : ''}
                            Enter the temporary password they gave you to finish signing in.
                        </Text>
                    </View>

                    <Text style={[styles.label, { color: colors.textSoft }]}>Temporary password</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: error ? '#DC2626' : colors.border },
                        ]}
                        value={password}
                        onChangeText={(v) => { setPassword(v); if (error) setError(null); }}
                        placeholder="Paste or type it here"
                        placeholderTextColor={colors.textSoft}
                        secureTextEntry
                        autoCapitalize="none"
                        autoFocus
                        editable={!submitting}
                        onSubmitEditing={handleVerify}
                    />
                    {!!error && <Text style={styles.errorText}>{error}</Text>}

                    <Pressable
                        onPress={handleVerify}
                        disabled={submitting}
                        style={({ pressed }) => [
                            styles.submitBtn,
                            submitting && styles.submitBtnDisabled,
                            pressed && !submitting && styles.submitBtnPressed,
                        ]}
                    >
                        <Text style={styles.submitBtnText}>{submitting ? 'Verifying…' : 'Verify & Continue'}</Text>
                    </Pressable>

                    <Pressable onPress={handleCancel} style={styles.cancelBtn} disabled={submitting}>
                        <Text style={[styles.cancelText, { color: colors.textSoft }]}>Not now</Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    flex1: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 28, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 28 },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFE4E6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
    subtitle: { marginTop: 10, fontSize: 14.5, textAlign: 'center', lineHeight: 21 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
    input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
    errorText: { marginTop: 8, fontSize: 13, color: '#DC2626', fontWeight: '600' },
    submitBtn: { marginTop: 22, height: 54, borderRadius: 27, backgroundColor: '#FF5F70', alignItems: 'center', justifyContent: 'center' },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnPressed: { opacity: 0.85 },
    submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    cancelBtn: { marginTop: 18, alignItems: 'center' },
    cancelText: { fontSize: 14, fontWeight: '600' },
});

export default ExpertPasswordVerifyScreen;
