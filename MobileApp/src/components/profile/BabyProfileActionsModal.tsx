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

                            <Icon
                                source={action.iconName}
                                size={24}
                                color={colors.text}
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
