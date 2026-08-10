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

type BabyProfileActionsModalProps = {
    visible: boolean;
    onClose: () => void;
    onEditBaby: () => void;
    onAddCaregiver: () => void;
    onEditEvents: () => void;
    onConfigureMainScreen: () => void;
    onReminders: () => void;
    // Only the owner caregiver can invite others (backend enforces this
    // too) — pass onCopyCode only when the selected baby's permission is
    // 'owner', which hides the row entirely for editors. Guests get a
    // different row instead (see showLoginPromptForCode below), since for
    // them the fix is "log in", not "you lack permission".
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
            id: 'edit',
            title: 'Edit baby profile',
            icon: 'pencil-outline',
            onPress: onEditBaby,
        },
        {
            id: 'caregiver',
            title: 'Add parent / caregiver',
            icon: 'account-plus-outline',
            onPress: onAddCaregiver,
        },
        {
            id: 'events',
            title: 'Create / Edit events',
            icon: 'calendar-edit',
            onPress: onEditEvents,
        },
        {
            id: 'configure',
            title: 'Main screen configuration',
            icon: 'view-dashboard-edit-outline',
            onPress: onConfigureMainScreen,
        },
        {
            id: 'reminders',
            title: 'Reminders',
            icon: 'bell-outline',
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
                                source={action.icon}
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
}

export default BabyProfileActionsModal;
