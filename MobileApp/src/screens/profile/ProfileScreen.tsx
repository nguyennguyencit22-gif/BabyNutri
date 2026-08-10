import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import {
    useDispatch,
    useSelector,
} from 'react-redux';
import Clipboard from '@react-native-clipboard/clipboard';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSummaryCard from '../../components/profile/ProfileSummaryCard';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import BabyProfileItem from '../../components/profile/BabyProfileItem';
import BabyProfileActionsModal from '../../components/profile/BabyProfileActionsModal';
import GuestProfileBanner from '../../components/profile/GuestProfileBanner';

import createStyles from '../../styles/profile/profileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

import {
    calculateBabyAgeInMonths,
} from '../../utils/calculateBabyAge';

import type {
    AppDispatch,
    RootState,
} from '../../store/Store';

import {
    removeBaby,
} from '../../store/babySlice';

import { getOrCreateInvitationCode } from '../../services/child.service';

import {
    Share,
} from 'react-native';

function ProfileScreen({
    navigation,
}: any) {
    const dispatch =
        useDispatch<AppDispatch>();

    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const babies = useSelector(
        (state: RootState) =>
            state.baby.babies,
    );

    const sessionMode = useSelector(
        (state: RootState) =>
            state.auth.mode,
    );

    const user = useSelector(
        (state: RootState) =>
            state.auth.user,
    );

    const [selectedBabyId, setSelectedBabyId] =
        React.useState<string | null>(null);

    const [showBabyActions, setShowBabyActions] =
        React.useState(false);

    const [invitationCode, setInvitationCode] =
        React.useState<string | null>(null);

    const isAuthenticated =
        sessionMode === 'authenticated' &&
        user !== null;

    const selectedBaby = babies.find(
        baby => baby.id === selectedBabyId,
    );

    const handleOpenBabyActions = (
        babyId: string,
    ) => {
        setSelectedBabyId(babyId);
        setShowBabyActions(true);
        setInvitationCode(null);

        // Only the owner of a real (backend-synced) baby can invite others
        // — guest babies and editor-only access don't get this row at all.
        const baby = babies.find(item => item.id === babyId);

        if (isAuthenticated && baby?.permission === 'owner') {
            getOrCreateInvitationCode(Number(babyId))
                .then(({ code }) => setInvitationCode(code))
                .catch(() => setInvitationCode(null));
        }
    };

    const handleCloseBabyActions = () => {
        setShowBabyActions(false);
    };

    const handleCopyCode = () => {
        if (!invitationCode) {
            return;
        }

        Clipboard.setString(invitationCode);
        Alert.alert(
            'Copied',
            `Invitation code ${invitationCode} copied to clipboard.`,
        );
    };

    const handleEditBaby = () => {
        if (!selectedBabyId) {
            return;
        }

        handleCloseBabyActions();

        navigation.navigate(
            'EditBabyProfile',
            {
                babyId: selectedBabyId,
            },
        );
    };

    const handleShareApp = async () => {
        try {
            const appLink =
                'https://babynutri.app/download';

            await Share.share({
                message:
                    `I recommend BabyNutri. Here is the link:\n${appLink}`,
                title: 'BabyNutri',
            });
        } catch (error) {
            console.log(
                'Share BabyNutri error:',
                error,
            );
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProfileHeader
                title="My Profile"
                onBack={() =>
                    navigation.goBack()
                }
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.scrollContent
                }>

                {isAuthenticated ? (
                    <ProfileSummaryCard
                        name={
                            user.displayName ||
                            'BabyNutri Parent'
                        }
                        email={user.email}
                        imageUrl={
                            user.photoURL
                        }
                        onChangePhoto={() => {
                            console.log(
                                'Change profile photo',
                            );
                        }}
                        onPress={() => {
                            navigation.navigate(
                                'AccountSettings',
                            );
                        }}
                    />
                ) : (
                    <GuestProfileBanner
                        onLogin={() => {
                            navigation.navigate(
                                'Login',
                            );
                        }}
                    />
                )}

                <Text style={styles.sectionLabel}>
                    PROFILES
                </Text>

                {babies.map(baby => (
                    <BabyProfileItem
                        key={baby.id}
                        name={baby.name}
                        profileColor={
                            baby.profileColor
                        }
                        ageInMonths={
                            calculateBabyAgeInMonths(
                                baby.dateOfBirth,
                            )
                        }
                        onPress={() =>
                            handleOpenBabyActions(
                                baby.id,
                            )
                        }
                        onEdit={() =>
                            handleOpenBabyActions(
                                baby.id,
                            )
                        }
                        onDelete={() => {
                            dispatch(
                                removeBaby(
                                    baby.id,
                                ),
                            );
                        }}
                    />
                ))}

                <ProfileMenuItem
                    title="Add baby profile"
                    leftIcon="plus"
                    onPress={() => {
                        navigation.navigate(
                            'AddBabyProfile',
                        );
                    }}
                />

                <ProfileMenuItem
                    title="Enter invitation code"
                    leftIcon="message-text-outline"
                    onPress={() => {
                        navigation.navigate(
                            'InvitationCode',
                        );
                    }}
                />

                <Text
                    style={
                        styles.otherSettingLabel
                    }>
                    OTHER SETTING
                </Text>

                <ProfileMenuItem
                    title="Settings"
                    showArrow
                    onPress={() => {
                        navigation.navigate('Settings');
                    }}
                />

                <ProfileMenuItem
                    title="Tell your friends"
                    onPress={handleShareApp}
                />

                <ProfileMenuItem
                    title="About"
                    onPress={() => {
                        navigation.navigate('About');
                    }}
                />

            </ScrollView>

            <BabyProfileActionsModal
                visible={showBabyActions}
                onClose={
                    handleCloseBabyActions
                }
                onEditBaby={
                    handleEditBaby
                }
                onAddCaregiver={() => {
                    if (!selectedBabyId) {
                        return;
                    }

                    console.log(
                        'Add caregiver:',
                        selectedBabyId,
                    );
                }}
                onEditEvents={() => {
                    if (!selectedBabyId) {
                        return;
                    }

                    console.log(
                        'Edit events:',
                        selectedBabyId,
                    );
                }}
                onConfigureMainScreen={() => {
                    if (!selectedBabyId) {
                        return;
                    }

                    console.log(
                        'Configure main screen:',
                        selectedBabyId,
                    );
                }}
                onReminders={() => {
                    if (!selectedBabyId) {
                        return;
                    }

                    console.log(
                        'Reminders:',
                        selectedBabyId,
                    );
                }}
                invitationCode={invitationCode}
                onCopyCode={
                    isAuthenticated &&
                        selectedBaby?.permission === 'owner'
                        ? handleCopyCode
                        : undefined
                }
                showLoginPromptForCode={!isAuthenticated}
                onRequestLogin={() => {
                    handleCloseBabyActions();
                    navigation.navigate('Login');
                }}
            />
        </SafeAreaView>
    );
}

export default ProfileScreen;