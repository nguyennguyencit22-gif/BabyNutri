import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSummaryCard from '../../components/profile/ProfileSummaryCard';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import BabyProfileItem from '../../components/profile/BabyProfileItem';
import BabyProfileActionsModal from '../../components/profile/BabyProfileActionsModal';
import GuestProfileBanner from '../../components/profile/GuestProfileBanner';

import createStyles from '../../styles/profile/profileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

import { calculateBabyAgeInMonths } from '../../utils/calculateBabyAge';
import type { AppDispatch, RootState } from '../../store/store';
import { deleteBaby } from '../../store/babySlice';

function ProfileScreen({ navigation }: any) {
    const dispatch = useDispatch<AppDispatch>();

    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const babies = useSelector((state: RootState) => state.baby.babies);
    const sessionMode = useSelector((state: RootState) => state.auth.mode);
    const user = useSelector((state: RootState) => state.auth.user);

    const [selectedBabyId, setSelectedBabyId] = React.useState<string | null>(null);
    const [showBabyActions, setShowBabyActions] = React.useState(false);

    const isAuthenticated = sessionMode === 'authenticated' && user !== null;
    const userRole = user?.role?.toLowerCase() ?? 'guest';

    const isExpert = userRole === 'expert';
    const isAdmin = userRole === 'admin';

    const handleOpenBabyActions = (babyId: string) => {
        setSelectedBabyId(babyId);
        setShowBabyActions(true);
    };

    const handleCloseBabyActions = () => {
        setShowBabyActions(false);
    };

    const handleEditBaby = () => {
        if (!selectedBabyId) return;

        handleCloseBabyActions();
        setTimeout(() => {
            navigation.navigate('EditBabyProfile', {
                babyId: selectedBabyId,
            });
        }, 100);
    };

    const getRoleTitle = () => {
        if (isAdmin) return 'System Admin';
        if (isExpert) return 'Nutrition Expert';
        return 'Parent';
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProfileHeader
                title="My Profile"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

                {/* USER PROFILE CARD */}
                {isAuthenticated ? (
                    <ProfileSummaryCard
                        name={`${user.displayName || 'BabyNutri User'} (${getRoleTitle()})`}
                        email={user.email}
                        imageUrl={user.photoURL}
                        onChangePhoto={() => {
                            console.log('Change profile photo');
                        }}
                        onPress={() => {
                            navigation.navigate('AccountSettings');
                        }}
                    />
                ) : (
                    <GuestProfileBanner
                        onLogin={() => {
                            navigation.navigate('Login');
                        }}
                    />
                )}

                {/* PROFILES SECTION (QUẢN LÝ HỒ SƠ BÉ) */}
                <Text style={styles.sectionLabel}>
                    PROFILES
                </Text>

                {babies.map(baby => (
                    <BabyProfileItem
                        key={String(baby.id)}
                        name={baby.name || 'Baby'}
                        profileColor={baby.profileColor || '#FF7A59'}
                        ageInMonths={calculateBabyAgeInMonths(baby.dateOfBirth || '')}
                        onPress={() =>
                            navigation.navigate('EditBabyProfile', {
                                babyId: String(baby.id),
                            })
                        }
                        onEdit={() => handleOpenBabyActions(String(baby.id))}
                        onDelete={() => {
                            dispatch(deleteBaby(baby.id));
                        }}
                    />
                ))}

                <ProfileMenuItem
                    title="Add baby profile"
                    leftIcon="plus"
                    onPress={() => {
                        navigation.navigate('AddBabyProfile');
                    }}
                />

                <ProfileMenuItem
                    title="Enter invitation code"
                    leftIcon="message-text-outline"
                    onPress={() => {
                        navigation.navigate('InvitationCode');
                    }}
                />

                {/* HISTORY SECTION */}
                <Text style={styles.sectionLabel}>
                    HISTORY
                </Text>

                <ProfileMenuItem
                    title="History"
                    leftIcon="history"
                    showArrow
                    onPress={() => {
                        navigation.navigate('SavedItems', { initialTab: 'history' });
                    }}
                />

                {/* OTHER SETTING SECTION (CHUẨN MEMBER A) */}
                <Text style={styles.otherSettingLabel}>
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

            </ScrollView>

            <BabyProfileActionsModal
                visible={showBabyActions}
                onClose={handleCloseBabyActions}
                onEditBaby={handleEditBaby}
                onAddCaregiver={() => {
                    if (!selectedBabyId) return;
                    console.log('Add caregiver:', selectedBabyId);
                }}
                onEditEvents={() => {
                    if (!selectedBabyId) return;
                    console.log('Edit events:', selectedBabyId);
                }}
                onConfigureMainScreen={() => {
                    if (!selectedBabyId) return;
                    console.log('Configure main screen:', selectedBabyId);
                }}
                onReminders={() => {
                    if (!selectedBabyId) return;
                    console.log('Reminders:', selectedBabyId);
                }}
            />
        </SafeAreaView>
    );
}

export default ProfileScreen;