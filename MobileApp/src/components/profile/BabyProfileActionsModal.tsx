import React from 'react';
import {
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import createStyles from '../../styles/profile/babyProfileActionsModalStyles';
import { useAppTheme } from '../../theme/useAppTheme';

interface BabyProfileActionsModalProps {
    visible: boolean;
    onClose: () => void;
    onWeaningMealPlan?: () => void;
    onEditBaby: () => void;
    onAddCaregiver: () => void;
    onEditEvents: () => void;
    onConfigureMainScreen: () => void;
    onReminders: () => void;
    onCopyCode?: () => void;
    onInputCode?: () => void;
    onCaregiverList?: () => void;
    onMeasurementSettings?: () => void;
    invitationCode?: string | null;
    showLoginPromptForCode?: boolean;
    onRequestLoginForCode?: () => void;
    onRequestLogin?: () => void;
}

export const BabyProfileActionsModal: React.FC<BabyProfileActionsModalProps> = ({
    visible,
    onClose,
    onWeaningMealPlan,
    onEditBaby,
    onAddCaregiver,
    onEditEvents,
    onConfigureMainScreen,
    onReminders,
    onCopyCode,
    onInputCode,
    onCaregiverList,
    onMeasurementSettings,
}) => {
    const { colors } = useAppTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const actions = [
        {
            id: 'weaning-meal-plan',
            title: 'Weaning Meal Plan',
            subtitle: "View & manage baby's weekly plan",
            iconName: 'calendar-month-outline',
            onPress: onWeaningMealPlan || (() => {}),
        },
        {
            id: 'edit',
            title: 'Edit Baby Profile',
            iconName: 'account-edit-outline',
            onPress: onEditBaby,
        },
        {
            id: 'caregiver',
            title: 'Add Parent / Caregiver',
            iconName: 'account-plus-outline',
            onPress: onAddCaregiver,
        },
        {
            id: 'events',
            title: 'Create / Edit Events',
            iconName: 'calendar-plus-outline',
            onPress: onEditEvents,
        },
        {
            id: 'configure',
            title: 'Main Screen Configuration',
            iconName: 'view-dashboard-outline',
            onPress: onConfigureMainScreen,
        },
        {
            id: 'reminders',
            title: 'Weaning Reminders',
            iconName: 'bell-outline',
            onPress: onReminders,
        },
        ...(onCopyCode
            ? [
                  {
                      id: 'copy-code',
                      title: 'Get Caregiver Code',
                      iconName: 'qrcode-scan',
                      onPress: onCopyCode,
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
                    {actions.map(action => (
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

                            <Icon
                                source={action.iconName}
                                size={22}
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
                    ))}
                </View>
            </View>
        </Modal>
    );
};

export default BabyProfileActionsModal;
