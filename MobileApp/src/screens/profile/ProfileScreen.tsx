import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import {
    useDispatch,
    useSelector,
} from 'react-redux';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSummaryCard from '../../components/profile/ProfileSummaryCard';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import BabyProfileItem from '../../components/profile/BabyProfileItem';
import BabyProfileActionsModal from '../../components/profile/BabyProfileActionsModal';
import GuestProfileBanner from '../../components/profile/GuestProfileBanner';

import styles from '../../styles/profile/profileStyles';

import {
    calculateBabyAgeInMonths,
} from '../../utils/calculateBabyAge';

import type {
    AppDispatch,
    RootState,
} from '../../store/Store';

import {
    deleteBaby,
} from '../../store/babySlice';

function ProfileScreen({
    navigation,
}: any) {
    const dispatch =
        useDispatch<AppDispatch>();

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

    const isAuthenticated =
        sessionMode === 'authenticated' &&
        user !== null;

    const handleOpenBabyActions = (
        babyId: string,
    ) => {
        setSelectedBabyId(babyId);
        setShowBabyActions(true);
    };

    const handleCloseBabyActions = () => {
        setShowBabyActions(false);
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
                                deleteBaby(
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
                    onPress={() => {
                        console.log(
                            'Open Settings',
                        );
                    }}
                />

                <ProfileMenuItem
                    title="Tell your friends"
                    onPress={() => {
                        console.log(
                            'Share app',
                        );
                    }}
                />

                <ProfileMenuItem
                    title="About"
                    onPress={() => {
                        console.log(
                            'Open About',
                        );
                    }}
                />

                {isAuthenticated ? (
                    <ProfileMenuItem
                        title="Account settings"
                        showArrow
                        onPress={() => {
                            navigation.navigate(
                                'AccountSettings',
                            );
                        }}
                    />
                ) : null}
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
            />
        </SafeAreaView>
    );
}

export default ProfileScreen;