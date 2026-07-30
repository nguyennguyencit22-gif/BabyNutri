import React from 'react';
import {
    ScrollView,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSummaryCard from '../../components/profile/ProfileSummaryCard';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import BabyProfileItem from '../../components/profile/BabyProfileItem';

import styles from '../../styles/profile/profileStyles';

import { calculateBabyAgeInMonths } from '../../utils/calculateBabyAge';

import type { RootState } from '../../store/Store';
import { deleteBaby } from '../../store/babySlice';
import BabyProfileActionsModal from '@/components/profile/BabyProfileActionsModal';

function ProfileScreen({ navigation }: any) {
    const babies = useSelector(
        (state: RootState) => state.baby.babies,
    );

    const dispatch = useDispatch();

    const [selectedBabyId, setSelectedBabyId] = React.useState<string | null>(null);

    const [showBabyActions, setShowBabyActions] = React.useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProfileHeader
                title="My Profile"
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

                <ProfileSummaryCard
                    name="Sophia’s Mom"
                    email="sophia@gmail.com"
                    imageUrl="https://i.pravatar.cc/300?img=47"
                    onChangePhoto={() => {
                        console.log('Change profile photo');
                    }}
                />

                <Text style={styles.sectionLabel}>
                    PROFILES
                </Text>

                {babies.map(baby => (
                    <BabyProfileItem
                        key={baby.id}
                        name={baby.name}
                        profileColor={baby.profileColor}
                        ageInMonths={calculateBabyAgeInMonths(
                            baby.dateOfBirth,
                        )}
                        onPress={() => {
                            setSelectedBabyId(baby.id);
                            setShowBabyActions(true);
                        }}
                        onEdit={() => {
                            setSelectedBabyId(baby.id);
                            setShowBabyActions(true);
                        }}
                        onDelete={() => {
                            dispatch(deleteBaby(baby.id));
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

                {/* <ProfileMenuItem
                    title="Add mom profile"
                    leftIcon="account-outline"
                    onPress={() => {
                        console.log('Add mom profile');
                    }}
                /> */}

                <ProfileMenuItem
                    title="Enter invitation code"
                    leftIcon="message-text-outline"
                    onPress={() => {
                        navigation.navigate(
                            'InvitationCode',
                        );
                    }}
                />

                <Text style={styles.otherSettingLabel}>
                    OTHER SETTING
                </Text>

                <ProfileMenuItem
                    title="Settings"
                    onPress={() => {
                        console.log('Open Settings');
                    }}
                />

                <ProfileMenuItem
                    title="Tell your friends"
                    onPress={() => {
                        console.log('Share app');
                    }}
                />

                <ProfileMenuItem
                    title="About"
                    onPress={() => {
                        console.log('Open About');
                    }}
                />

                <ProfileMenuItem
                    title="Account settings"
                    showArrow
                    onPress={() => {
                        navigation.navigate(
                            'AccountSettings',
                        );
                    }}
                />

                {/* <View style={styles.deactiveAccount}>
                    <ProfileMenuItem
                        title="Deactivate account"
                        leftIcon="delete-outline"
                        showArrow={false}
                        danger
                        onPress={() => {
                            console.log(
                                'Deactivate account',
                            );
                        }}
                    />
                </View> */}
            </ScrollView>
            <BabyProfileActionsModal
                visible={showBabyActions}
                onClose={() => setShowBabyActions(false)}
                onEditBaby={() => {
                    if (!selectedBabyId) {
                        return;
                    }

                    navigation.navigate(
                        'EditBabyProfile',
                        {
                            babyId: selectedBabyId,
                        },
                    );
                }}
                onAddCaregiver={() => {
                    console.log('Add caregiver:', selectedBabyId);
                }}
                onEditEvents={() => {
                    console.log('Edit events:', selectedBabyId);
                }}
                onConfigureMainScreen={() => {
                    console.log(
                        'Configure main screen:',
                        selectedBabyId,
                    );
                }}
                onReminders={() => {
                    console.log('Reminders:', selectedBabyId);
                }}
            />
        </SafeAreaView>
    );
}

export default ProfileScreen;