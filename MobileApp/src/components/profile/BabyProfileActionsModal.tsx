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
};

function BabyProfileActionsModal({
    visible,
    onClose,
    onEditBaby,
    onAddCaregiver,
    onEditEvents,
    onConfigureMainScreen,
    onReminders,
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

                            <Text style={styles.actionText}>
                                {action.title}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </Modal>
    );
}

export default BabyProfileActionsModal;