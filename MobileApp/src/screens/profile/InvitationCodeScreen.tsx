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
import { useDispatch } from 'react-redux';

import ProfileHeader from '../../components/profile/ProfileHeader';
import Icon from '../../components/common/AppIcon';
import createStyles from '@/styles/profile/invitationCodeStyles';
import { useAppTheme } from '@/theme/useAppTheme';
import type { AppDispatch } from '@/store/Store';
import { loadBabies } from '@/store/babySlice';
import { selectBaby } from '@/store/babySlice';
import { activateInvitationCode } from '@/services/child.service';

function InvitationCodeScreen({ navigation }: any) {
    const dispatch = useDispatch<AppDispatch>();
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const [activating, setActivating] =
        React.useState(false);

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

    const handleActivate = async () => {
        if (!validateCode() || activating) {
            return;
        }

        const formattedCode =
            invitationCode.trim().toUpperCase();

        try {
            setActivating(true);

            const { childId } =
                await activateInvitationCode(formattedCode);

            // Pull the shared baby (and anything else this account can now
            // see) from MySQL into Redux, then focus it.
            await dispatch(loadBabies());
            dispatch(selectBaby(String(childId)));

            Alert.alert(
                'Invitation code',
                'You now have access to this baby profile.',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Home' }],
                            }),
                    },
                ],
            );
        } catch (error) {
            setCodeError(
                error instanceof Error
                    ? error.message
                    : 'Invalid or already-used invitation code.',
            );
        } finally {
            setActivating(false);
        }
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
                            <Icon source="lightbulb-on-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />

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
                            outlineColor={colors.border}
                            activeOutlineColor={colors.text}
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
                            disabled={!canActivate || activating}
                            loading={activating}
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