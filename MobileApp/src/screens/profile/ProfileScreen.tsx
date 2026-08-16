import React from 'react';
import { Alert, ScrollView, Share } from 'react-native';
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
import ExpertProfileCard from '../../components/profile/ExpertProfileCard';
import AdminManageExpertsModal from '../admin/AdminManageExpertsModal';
import AdminReportsModal from '../admin/AdminReportsModal';

import createStyles from '../../styles/profile/profileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

import { calculateBabyAgeInMonths } from '../../utils/calculateBabyAge';
import type {
    AppDispatch,
    RootState,
} from '../../store/Store';

import {
    removeBaby,
} from '../../store/babySlice';

import { getOrCreateInvitationCode } from '../../services/child.service';

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

    const babies = useSelector((state: RootState) => state.baby.babies);
    const sessionMode = useSelector((state: RootState) => state.auth.mode);
    const user = useSelector((state: RootState) => state.auth.user);

    const [selectedBabyId, setSelectedBabyId] = React.useState<string | null>(null);
    const [showBabyActions, setShowBabyActions] = React.useState(false);
    const [invitationCode, setInvitationCode] = React.useState<string | null>(null);
    const [showAdminExpertsModal, setShowAdminExpertsModal] = React.useState(false);
    const [showAdminReportsModal, setShowAdminReportsModal] = React.useState(false);

    const isAuthenticated = sessionMode === 'authenticated' && user !== null;
    const userRole = (user?.role || '').toLowerCase();
    const isAdmin = isAuthenticated && userRole === 'admin';
    const isExpert = isAuthenticated && userRole === 'expert';

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
        if (!selectedBabyId) return;

        handleCloseBabyActions();
        setTimeout(() => {
            navigation.navigate('EditBabyProfile', {
                babyId: selectedBabyId,
            });
        }, 100);
    };

    const handleShareApp = async () => {
        try {
            const appLink = 'https://babynutri.app/download';
            await Share.share({
                message: `I recommend BabyNutri. Here is the link:\n${appLink}`,
                title: 'BabyNutri',
            });
        } catch (error) {
            console.log('Share BabyNutri error:', error);
        }
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
                        name={user.displayName || (isAdmin ? 'System Administrator' : isExpert ? 'Nutrition Expert' : 'BabyNutri Parent')}
                        email={user.email}
                        imageUrl={user.photoURL}
                        roleLabel={isAdmin ? 'Administrator' : isExpert ? 'Nutrition Expert' : undefined}
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

                {isAdmin ? (
                    <>
                        <Text style={[styles.sectionLabel, { color: '#8B5CF6' }]}>
                            ADMINISTRATION & MANAGEMENT
                        </Text>
                        <ProfileMenuItem
                            title="Manage Nutrition Experts"
                            leftIcon="account-cog"
                            showArrow
                            onPress={() => setShowAdminExpertsModal(true)}
                        />
                        <ProfileMenuItem
                            title="System Reports & Statistics"
                            leftIcon="chart-bar"
                            showArrow
                            onPress={() => setShowAdminReportsModal(true)}
                        />
                    </>
                ) : isExpert ? (
                    <>
                        <Text style={styles.sectionLabel}>
                            PROFESSIONAL INFO
                        </Text>
                        <ExpertProfileCard />
                    </>
                ) : (
                    <>
                        {/* PROFILES SECTION */}
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
                    </>
                )}

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

                {/* OTHER SETTINGS SECTION */}
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
                onClose={handleCloseBabyActions}
                onGrowthTracking={() => {
                    handleCloseBabyActions();
                    navigation.navigate('GrowthTracking', { childId: selectedBabyId });
                }}
                onWeaningMealPlan={() => {
                    handleCloseBabyActions();
                    navigation.navigate('MealPlanList', { childId: selectedBabyId });
                }}
                onEditBaby={handleEditBaby}
                onAddCaregiver={() => {
                    if (!selectedBabyId) return;
                    console.log('Add caregiver:', selectedBabyId);
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

            {isAdmin && (
                <>
                    <AdminManageExpertsModal
                        visible={showAdminExpertsModal}
                        onClose={() => setShowAdminExpertsModal(false)}
                    />
                    <AdminReportsModal
                        visible={showAdminReportsModal}
                        onClose={() => setShowAdminReportsModal(false)}
                    />
                </>
            )}
        </SafeAreaView>
    );
}

export default ProfileScreen;