import React from 'react';
import {
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import createStyles from '../../styles/profile/babyProfileActionsModalStyles';
import { useAppTheme } from '../../theme/useAppTheme';

// Pure SVG Icon components
const PencilIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </Svg>
);

const UserPlusIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <Path d="M8.5 11a4 4 0 100-8 4 4 0 000 8z" />
    <Path d="M20 8v6M23 11h-6" />
  </Svg>
);

const CalendarIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 0-2-2zM16 2v4M8 2v4M3 10h18" />
  </Svg>
);

const DashboardIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h6v8H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 16h6v4H4z" />
  </Svg>
);

const BellIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </Svg>
);

type BabyProfileActionsModalProps = {
    visible: boolean;
    onClose: () => void;
    onEditBaby: () => void;
    onAddCaregiver: () => void;
    onEditEvents: () => void;
    onConfigureMainScreen: () => void;
    onReminders: () => void;
    onWeaningMealPlan?: () => void;
    invitationCode?: string | null;
    onCopyCode?: () => void;
    showLoginPromptForCode?: boolean;
    onRequestLogin?: () => void;
};

function BabyProfileActionsModal({
    visible,
    onClose,
    onEditBaby,
    onAddCaregiver,
    onEditEvents,
    onConfigureMainScreen,
    onReminders,
    onWeaningMealPlan,
    invitationCode,
    onCopyCode,
    showLoginPromptForCode,
    onRequestLogin,
}: BabyProfileActionsModalProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const actions = [
        {
            id: 'weaning-meal-plan',
            title: 'Weaning Meal Plan',
            subtitle: "View & manage baby's weekly plan",
            icon: CalendarIcon,
            onPress: onWeaningMealPlan || (() => {}),
        },
        {
            id: 'edit',
            title: 'Edit Baby Profile',
            icon: PencilIcon,
            onPress: onEditBaby,
        },
        {
            id: 'caregiver',
            title: 'Add Parent / Caregiver',
            icon: UserPlusIcon,
            onPress: onAddCaregiver,
        },
        {
            id: 'events',
            title: 'Create / Edit Events',
            icon: CalendarIcon,
            onPress: onEditEvents,
        },
        {
            id: 'configure',
            title: 'Main Screen Configuration',
            icon: DashboardIcon,
            onPress: onConfigureMainScreen,
        },
        {
            id: 'reminders',
            title: 'Weaning Reminders',
            icon: BellIcon,
            onPress: onReminders,
        },
        ...(onCopyCode
            ? [
                {
                    id: 'copy-code',
                    title: "Copy baby's code",
                    subtitle: invitationCode ?? 'Generating…',
                    icon: 'content-copy',
                    onPress: onCopyCode,
                },
            ]
            : showLoginPromptForCode && onRequestLogin
                ? [
                    {
                        id: 'copy-code',
                        title: "Copy baby's code",
                        subtitle: "Log in to get baby's code",
                        icon: 'content-copy',
                        onPress: onRequestLogin,
                    },
                ]
                : []),
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>

            <View style={styles.overlay}>
                <Pressable
                    style={styles.backdrop}
                    onPress={onClose}
                />

                <View style={styles.sheet}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12, paddingHorizontal: 4 }}>
                        ⚙️ Baby Profile Options
                    </Text>
                    {actions.map(action => {
                        const IconComponent = action.icon;
                        return (
                            <Pressable
                                key={action.id}
                                onPress={() => {
                                    onClose();
                                    setTimeout(() => {
                                        action.onPress();
                                    }, 100);
                                }}
                                style={({ pressed }) => [
                                    styles.actionRow,
                                    pressed && styles.actionRowPressed,
                                ]}>

                                <IconComponent
                                    size={20}
                                    color={colors.primary}
                                />

                                {action.subtitle ? (
                                    <View style={styles.actionTextGroup}>
                                        <Text style={styles.actionText}>
                                            {action.title}
                                        </Text>
                                        <Text style={styles.actionSubtitle}>
                                            {action.subtitle}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.actionText}>
                                        {action.title}
                                    </Text>
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </Modal>
    );
}

export default BabyProfileActionsModal;
