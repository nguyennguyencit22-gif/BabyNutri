import React from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Button,
    Text,
    TextInput,
} from 'react-native-paper';

import ProfileHeader from '../../components/profile/ProfileHeader';
import styles from '@/styles/profile/invitationCodeStyles';

function InvitationCodeScreen({ navigation }: any) {
    const [currentStep, setCurrentStep] =
        React.useState<0 | 1>(0);

    const [invitationCode, setInvitationCode] =
        React.useState('');

    const [codeError, setCodeError] =
        React.useState('');

    const handleNext = () => {
        setCurrentStep(1);
    };

    const handleBack = () => {
        if (currentStep === 1) {
            setCurrentStep(0);
            return;
        }

        navigation.goBack();
    };

    const validateCode = (): boolean => {
        const formattedCode =
            invitationCode.trim();

        if (!formattedCode) {
            setCodeError(
                'Please enter an invitation code.',
            );
            return false;
        }

        if (formattedCode.length < 6) {
            setCodeError(
                'Invitation code must contain at least 6 characters.',
            );
            return false;
        }

        setCodeError('');
        return true;
    };

    const handleActivate = () => {
        if (!validateCode()) {
            return;
        }

        const formattedCode =
            invitationCode.trim().toUpperCase();

        console.log(
            'Invitation code:',
            formattedCode,
        );

        // Sau này gọi API kiểm tra code ở đây.
        Alert.alert(
            'Invitation code',
            'The invitation code has been submitted.',
        );
    };

    const isValidInvitationCode = (
        code: string,
    ) => {
        const formatted =
            code.trim().toUpperCase();

        const regex =
            /^BN-[A-Z0-9]{6}$/;
        return regex.test(formatted);
    };
    const canActivate =
        isValidInvitationCode(invitationCode);
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }>

                <ProfileHeader
                    title=""
                    onBack={handleBack}
                />

                {currentStep === 0 ? (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={
                            styles.introContent
                        }>

                        <Image
                            source={require(
                                '../../assets/images/invitation-caregiver.png'
                            )}
                            style={styles.illustration}
                            resizeMode="contain"
                        />

                        <Text style={styles.description}>
                            The Primary parent can provide
                            you with an invitation code to
                            access their baby's profile and
                            activate premium features.
                        </Text>

                        <View style={styles.tipRow}>
                            <Text style={styles.tipIcon}>
                                💡
                            </Text>

                            <Text style={styles.tipText}>
                                You will need to log in to
                                your account and enter this
                                invitation code.
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <Text
                            style={styles.secondaryDescription}>
                            The Primary parent is the user
                            who created the baby's profile
                            and logged in to the app,
                            thereby linking their account
                            and the baby's profile.
                        </Text>

                        <Button
                            mode="contained"
                            style={styles.primaryButton}
                            contentStyle={
                                styles.buttonContent
                            }
                            labelStyle={
                                styles.buttonLabel
                            }
                            onPress={handleNext}>
                            Next
                        </Button>
                    </ScrollView>
                ) : (
                    <View style={styles.codeContent}>
                        <Text style={styles.instruction}>
                            Ask the Primary parent to
                            generate an invitation code to
                            access the existing baby’s
                            profile (Account - Baby name -
                            Add parent / caregiver).
                        </Text>

                        <TextInput
                            mode="outlined"
                            value={invitationCode}
                            onChangeText={text => {
                                setInvitationCode(text);

                                if (!text.trim()) {
                                    setCodeError('');
                                    return;
                                }

                                if (!isValidInvitationCode(text)) {
                                    setCodeError(
                                        'Invitation code is invalid.',
                                    );
                                } else {
                                    setCodeError('');
                                }
                            }}
                            placeholder="Enter invitation code here"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            error={Boolean(codeError)}
                            outlineColor="#F1E7E4"
                            activeOutlineColor="#5B0010"
                            style={styles.codeInput}
                            outlineStyle={
                                styles.inputOutline
                            }
                            contentStyle={
                                styles.inputContent
                            }
                        />

                        {codeError ? (
                            <Text style={styles.errorText}>
                                {codeError}
                            </Text>
                        ) : null}

                        <Button
                            mode="contained"
                            disabled={!canActivate}
                            style={[
                                styles.activateButton,
                                !canActivate &&
                                styles.activateButtonDisabled,
                            ]}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                            onPress={handleActivate}>
                            Activate
                        </Button>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default InvitationCodeScreen;