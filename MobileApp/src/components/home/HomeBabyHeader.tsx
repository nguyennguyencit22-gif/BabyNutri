import React from 'react';
import {
    Alert,
    View,
    Pressable,
    TouchableOpacity,
} from 'react-native';

import {
    Avatar,
    Text,
} from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
import Clipboard from '@react-native-clipboard/clipboard';

import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type {
    RootState,
} from '../../store/Store';

import type {
    RootStackParamList,
} from '../../types/navigation/navigationTopTypes';

import {
    calculateBabyAgeInMonths,
} from '../../utils/calculateBabyAge';

import createStyles from '../../styles/home/homeBabyHeaderStyles';
import BabySwitcherModal from './BabySwitcherModal';
import BabyProfileActionsModal from '../profile/BabyProfileActionsModal';
import { useAppTheme } from '../../theme/useAppTheme';
import { getOrCreateInvitationCode } from '../../services/child.service';

const BellIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </Svg>
);

function HomeBabyHeader() {

    const babies = useSelector(
        (state: RootState) =>
            state.baby.babies,
    );

    const selectedBabyId = useSelector(
        (state: RootState) =>
            state.baby.selectedBabyId,
    );

    const selectedBaby =
        babies.find(
            baby =>
                String(baby.id) ===
                String(selectedBabyId),
        ) || babies[0];

    const hasMultipleBaby =
        babies.length > 1;

    const sessionMode = useSelector(
        (state: RootState) => state.auth.mode,
    );

    const isAuthenticated = sessionMode === 'authenticated';

    const [showBabySwitcher, setShowBabySwitcher] = React.useState(false);
    const [showBabyActions, setShowBabyActions] = React.useState(false);
    const [invitationCode, setInvitationCode] =
        React.useState<string | null>(null);

    const navigation =
        useNavigation<
            NativeStackNavigationProp<RootStackParamList>
        >();

    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const handleOpenBabyActions = () => {
        setShowBabyActions(true);
        setInvitationCode(null);

        if (
            sessionMode === 'authenticated' &&
            selectedBaby?.permission === 'owner'
        ) {
            getOrCreateInvitationCode(Number(selectedBaby.id))
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
        if (!selectedBaby) {
            return;
        }

        handleCloseBabyActions();

        navigation.navigate('EditBabyProfile', {
            babyId: selectedBaby.id,
        });
    };

    return (

        <View style={styles.container}>

            <Pressable
                style={({ pressed }) => [
                    styles.userInfo,
                    pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                    if (!selectedBaby) {
                        navigation.navigate('AddBabyProfile');
                    } else {
                        setShowBabySwitcher(true);
                    }
                }}>

                <Avatar.Text
                    size={56}
                    label={
                        selectedBaby
                            ? selectedBaby.name
                                .charAt(0)
                                .toUpperCase()
                            : 'B'
                    }
                    style={[
                        styles.avatar,
                        {
                            backgroundColor:
                                selectedBaby
                                    ?.profileColor ??
                                colors.primary,
                        },
                    ]}
                />

                <View style={styles.textContainer}>

                    <View style={styles.nameRow}>

                        <Text style={styles.babyName}>

                            {selectedBaby
                                ? selectedBaby.name
                                : "Baby's Name"}

                        </Text>

                        {hasMultipleBaby && (

                            <Pressable
                                onPress={() =>
                                    setShowBabySwitcher(true)
                                }>

                                <Text
                                    style={
                                        styles.arrow
                                    }>
                                    ▼
                                </Text>

                            </Pressable>

                        )}

                    </View>

                    <Text style={styles.babyAge}>

                        {selectedBaby
                            ? `${calculateBabyAgeInMonths(
                                selectedBaby.dateOfBirth,
                            )} months`
                            : 'Create baby profile'}

                    </Text>

                </View>

            </Pressable>

            <View style={styles.rightActions}>

                <TouchableOpacity
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: colors.primarySoft || '#FFF0F2',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => { }}
                    activeOpacity={0.8}
                >
                    <BellIcon size={20} color={colors.primary} />
                </TouchableOpacity>

                <View
                    style={
                        styles.profileDot
                    }
                />

            </View>

            <BabySwitcherModal
                visible={showBabySwitcher}
                onClose={() =>
                    setShowBabySwitcher(false)
                }
            />

            <BabyProfileActionsModal
                visible={showBabyActions}
                onClose={handleCloseBabyActions}
                onGrowthTracking={() => {
                    handleCloseBabyActions();
                    (navigation as any).navigate('GrowthTracking', { childId: selectedBaby?.id });
                }}
                onWeaningMealPlan={() => {
                    handleCloseBabyActions();
                    (navigation as any).navigate('MealPlanList', { childId: selectedBaby?.id });
                }}
                onEditBaby={handleEditBaby}
                onAddCaregiver={() => {
                    if (!selectedBaby) {
                        return;
                    }

                    console.log(
                        'Add caregiver:',
                        selectedBaby.id,
                    );
                }}
                onEditEvents={() => {
                    if (!selectedBaby) {
                        return;
                    }

                    console.log(
                        'Edit events:',
                        selectedBaby.id,
                    );
                }}
                onConfigureMainScreen={() => {
                    if (!selectedBaby) {
                        return;
                    }

                    console.log(
                        'Configure main screen:',
                        selectedBaby.id,
                    );
                }}
                onReminders={() => {
                    if (!selectedBaby) {
                        return;
                    }

                    console.log(
                        'Reminders:',
                        selectedBaby.id,
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
        </View>

    );
}

export default HomeBabyHeader;