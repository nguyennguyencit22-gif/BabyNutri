import React from 'react';
import {
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import createStyles from '../../styles/profile/babyProfileActionsModalStyles';
import { useAppTheme } from '../../theme/useAppTheme';

type IconProps = { size?: number; color?: string };

const PencilIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z" />
    </Svg>
);

const AccountPlusIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <Circle cx="8.5" cy="7" r="4" />
        <Path d="M20 8v6M23 11h-6" />
    </Svg>
);

const CalendarEditIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="4" width="18" height="18" rx="2" />
        <Path d="M16 2v4M8 2v4M3 10h18" />
        <Path d="M14.5 15.5L18 14l-1 3.5L13 21l-.5-3.5z" />
    </Svg>
);

const DashboardEditIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="3" width="7" height="9" rx="1" />
        <Rect x="14" y="3" width="7" height="5" rx="1" />
        <Rect x="14" y="12" width="7" height="9" rx="1" />
        <Rect x="3" y="16" width="7" height="5" rx="1" />
    </Svg>
);

const BellOutlineIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </Svg>
);

const ContentCopyIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="9" y="9" width="12" height="12" rx="2" />
        <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </Svg>
);

const KeyOutlineIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="7.5" cy="15.5" r="5.5" />
        <Path d="M21 2l-9.6 9.6M15.5 7.5L18 5M18.5 8.5L21 6" />
    </Svg>
);

const AccountGroupIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <Circle cx="9" cy="7" r="4" />
        <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </Svg>
);

const ScaleIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="3" width="18" height="18" rx="2" />
        <Path d="M12 7v10M8 17h8" />
    </Svg>
);

const ChartLineIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 3v18h18" />
        <Path d="M18.7 8l-5.1 5.2-4-4L3 15.6" />
    </Svg>
);

const CalendarMonthIcon = ({ size = 24, color = '#4B3034' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="4" width="18" height="18" rx="2" />
        <Path d="M16 2v4M8 2v4M3 10h18" />
        <Circle cx="8" cy="15" r="1" fill={color} />
        <Circle cx="12" cy="15" r="1" fill={color} />
        <Circle cx="16" cy="15" r="1" fill={color} />
    </Svg>
);

const ACTION_ICONS: Record<string, React.ComponentType<IconProps>> = {
    'pencil-outline': PencilIcon,
    'account-plus-outline': AccountPlusIcon,
    'calendar-edit': CalendarEditIcon,
    'view-dashboard-edit-outline': DashboardEditIcon,
    'bell-outline': BellOutlineIcon,
    'content-copy': ContentCopyIcon,
    'key-outline': KeyOutlineIcon,
    'account-group-outline': AccountGroupIcon,
    'scale-bathroom': ScaleIcon,
    'chart-line': ChartLineIcon,
    'calendar-month-outline': CalendarMonthIcon,
};

interface BabyProfileActionsModalProps {
    visible: boolean;
    onClose: () => void;
    onGrowthTracking?: () => void;
    onWeaningMealPlan?: () => void;
    onEditBaby: () => void;
    onAddCaregiver?: () => void;
    onEditEvents?: () => void;
    onConfigureMainScreen?: () => void;
    onReminders?: () => void;
    // Only the owner caregiver can invite others (backend enforces this
    // too) — pass onCopyCode only when the selected baby's permission is
    // 'owner', which hides the row entirely for editors. Guests get a
    // different row instead (see showLoginPromptForCode below), since for
    // them the fix is "log in", not "you lack permission".
    invitationCode?: string | null;
    onCopyCode?: () => void;
    onInputCode?: () => void;
    onCaregiverList?: () => void;
    onMeasurementSettings?: () => void;
    showLoginPromptForCode?: boolean;
    onRequestLogin?: () => void;
}

export const BabyProfileActionsModal: React.FC<BabyProfileActionsModalProps> = ({
    visible,
    onClose,
    onGrowthTracking,
    onWeaningMealPlan,
    onEditBaby,
    onAddCaregiver,
    onEditEvents,
    onConfigureMainScreen,
    onReminders,
    invitationCode,
    onCopyCode,
    onInputCode,
    onCaregiverList,
    onMeasurementSettings,
    showLoginPromptForCode,
    onRequestLogin,
}) => {
    const { colors } = useAppTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const actions = [
        {
            id: 'edit',
            title: 'Edit baby profile',
            iconName: 'pencil-outline',
            onPress: onEditBaby,
        },
        ...(onAddCaregiver
            ? [
                  {
                      id: 'caregiver',
                      title: 'Add parent / caregiver',
                      iconName: 'account-plus-outline',
                      onPress: onAddCaregiver,
                  },
              ]
            : []),
        ...(onEditEvents
            ? [
                  {
                      id: 'events',
                      title: 'Create / Edit events',
                      iconName: 'calendar-edit',
                      onPress: onEditEvents,
                  },
              ]
            : []),
        ...(onConfigureMainScreen
            ? [
                  {
                      id: 'configure',
                      title: 'Main screen configuration',
                      iconName: 'view-dashboard-edit-outline',
                      onPress: onConfigureMainScreen,
                  },
              ]
            : []),
        ...(onReminders
            ? [
                  {
                      id: 'reminders',
                      title: 'Reminders',
                      iconName: 'bell-outline',
                      onPress: onReminders,
                  },
              ]
            : []),
        ...(onInputCode
            ? [
                  {
                      id: 'input-code',
                      title: 'Enter Caregiver Code',
                      iconName: 'key-outline',
                      onPress: onInputCode,
                  },
              ]
            : []),
        ...(onCaregiverList
            ? [
                  {
                      id: 'caregiver-list',
                      title: 'Caregiver List',
                      iconName: 'account-group-outline',
                      onPress: onCaregiverList,
                  },
              ]
            : []),
        ...(onMeasurementSettings
            ? [
                  {
                      id: 'measurement-settings',
                      title: 'Measurement Settings',
                      iconName: 'scale-bathroom',
                      onPress: onMeasurementSettings,
                  },
              ]
            : []),
        ...(onGrowthTracking
            ? [
                  {
                      id: 'growth-tracking',
                      title: 'Growth Tracking (WHO)',
                      subtitle: 'View growth chart & BMI history',
                      iconName: 'chart-line',
                      onPress: onGrowthTracking,
                  },
              ]
            : []),
        ...(onWeaningMealPlan
            ? [
                  {
                      id: 'weaning-meal-plan',
                      title: 'Weaning Meal Plan',
                      subtitle: "View & manage baby's weekly plan",
                      iconName: 'calendar-month-outline',
                      onPress: onWeaningMealPlan,
                  },
              ]
            : []),
        ...(onCopyCode
            ? [
                  {
                      id: 'copy-code',
                      title: "Copy baby's code",
                      subtitle: invitationCode ?? 'Generating…',
                      iconName: 'content-copy',
                      onPress: onCopyCode,
                  },
              ]
            : showLoginPromptForCode && onRequestLogin
                ? [
                      {
                          id: 'copy-code',
                          title: "Copy baby's code",
                          subtitle: "Log in to get baby's code",
                          iconName: 'content-copy',
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
            statusBarTranslucent
            onRequestClose={onClose}>

            <View style={styles.overlay}>
                <Pressable
                    style={styles.backdrop}
                    onPress={onClose}
                />

                <View style={styles.sheet}>
                    {actions.map(action => (
                        <Pressable
                            key={action.id}
                            onPress={() => {
                                onClose();
                                action.onPress();
                            }}
                            style={({ pressed }) => [
                                styles.actionRow,
                                pressed && styles.actionRowPressed,
                            ]}>

                            {React.createElement(
                                ACTION_ICONS[action.iconName] ?? PencilIcon,
                                { size: 24, color: colors.text },
                            )}

                            {action.subtitle ? (
                                <View style={styles.actionTextGroup}>
                                    <Text style={styles.actionTitleInGroup}>
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
                    ))}
                </View>
            </View>
        </Modal>
    );
};

export default BabyProfileActionsModal;
